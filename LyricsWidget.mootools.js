var LyricsWidget = new Class({
    Implements: Options,
    options: {
        songLength: "3:00",
        bookmarks: [],
        playBtn: "lyrics-play",
        lyricsDiv: "scroll",
        flashId: "SoundPlayer",
        autoPlay: false,
        timeDisplay: "lyrics-time",
        scrollDuration: 2000
    },
    initialize: function(options) {
        LW = this;

        // set the options, usual part of any mootools class          
        this.setOptions(options);
        
        this.isPlaying = false;
        
        this.counter = 0;
        
        this.paragraph = 0;
        
        this.timer = {};

        this.flashObject = $(this.options.flashId);

        this.songLengthInMs = this.toMs(this.options.songLength);
        
        this.scroller = new Fx.Scroll($(this.options.lyricsDiv), {duration: this.options.scrollDuration});  //{duration:this.songLengthInMs});
        
        this.bookmarks = [];

        $each(this.options.bookmarks, function(i) {
          LW.bookmarks.push(LW.toMs(i)-LW.options.scrollDuration);
        });
        
        if (this.options.autoPlay) {
          LW.play();  
        }                            
        $(this.options.playBtn).addEvent("click", function() {
          LW.toggle();
        });
    },
    toMs: function(timeString) {
        var reg = /^([0-9]{1,2}):([0-9]{2})$/;
        var time = reg.exec(timeString);
        if (!$chk(time[0]))
          return false;     
        // convert those minutes to those millilililililililiseconds
        var minutes = parseInt(time[1]);              
        var seconds = parseInt(time[2]);

        var milliseconds = ((minutes * 60) + seconds) * 1000;
        return milliseconds;
    },
    play: function() {
      if (this.counter == 0) {
        // first play
        this.scroller.toTop();
      }
      LW.changePlayButtonText("Pause");
      this.flashObject.flashPlay();            
      this.isPlaying = true;
      this.counter = this.flashObject.flashPosition();
      $(this.options.timeDisplay).setStyle('textDecoration',"none");
      $(LW.options.timeDisplay).set("text", LW.toTime(LW.counter));            

      this.timer = (function() { 
        LW.counter += 1000;
        
        LW.checkBookmark(LW.counter);
        $(LW.options.timeDisplay).set("text", LW.toTime(LW.counter));
      }).periodical(1000);
    },
    pause: function() {
      LW.changePlayButtonText("Play");
      this.flashObject.flashPause();
      this.isPlaying = false;
      this.counter = this.flashObject.flashPosition();
      $clear(this.timer);
     $(this.options.timeDisplay).setStyle('textDecoration',"blink");
    },
    toggle: function() {
      if (this.isPlaying)
        LW.pause();
      else
        LW.play();
    },
    changePlayButtonText: function(string) {
      $(this.options.playBtn).set('text', string);
    },
    flashCmd: function(string) {
      sendCommand(string);
    },
    checkBookmark: function(time) {
      if (this.bookmarks.contains(time)) {
        this.scrollToNextParagraph();
      }
    },
    scrollToNextParagraph: function() {            
     this.scroller.toElement( 

        $(this.options.lyricsDiv).getChildren("p")[this.paragraph+1] );
      this.paragraph++;
    },
    toTime: function(ms) {
      //ms+=1000;
      var seconds = ms/1000;
      var minutes = seconds / 60;
      
      // round to floor minute
      minutes = Math.floor(minutes);
      
      // remainder is the num seconds
      var remainder = seconds-(minutes*60);
      
      // pad for < 10 seconds.
      // the closure below converts the int from above ^ 
      // into a string so that length can be discovered.
      if ((remainder + "").length == 1)
        remainder = "0" + remainder;

      return minutes + ":" + remainder;
    }
});