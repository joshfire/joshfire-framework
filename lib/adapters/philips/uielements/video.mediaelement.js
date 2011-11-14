/*!
 * Joshfire Framework 0.9.1
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jul 20 20:23:43 2011
 */

Joshfire.define(['joshfire/uielements/video', 'joshfire/class', 'joshfire/vendor/underscore'], function(Video, Class, _) {


  /**
  * @class Video component on Philips TV
  * @name adapters_philips_uielements_video.medialement
  * @augments uielements_video
  */
  return Class(Video, {
    /**
    * @lends adapters_philips_uielements_video.medialement.prototype
    */
    
     /**
      * Default options:<br /><ul>
      *   <li>innerTemplate {String}: &lt;object&gt;</li>
      *   <li>movingStep {int}: In seconds, the time step used when rewinding or fast fwding a video</li>
      * </ul>
      * @function
      * @return {Object} hash of options.
      */
      getDefaultOptions: function() {
        return _.extend(this.__super(), {
          innerTemplate: '<object id="<%=htmlId%>_video"></object>',
//          innerTemplate: '<object id="video"></object>',
          loadingTemplate: 'Loading...',
          movingStep:30
        });
      },
    /**
    * init
    * @function
    *
    */
    listeners:{},
    player:false,
    videoStatus:false,
    init: function() {
      var self = this;
      // Event listeners
      self.listeners = {};

      // Should have an HTML5 <video>-like API
      self.player = false;

      // Status of the video
      self.videoStatus = false;

      // Current video duration
      self.videoDuration = 0;
      self.app.subscribe('input', function(ev, data) {
        if (self.isDefaultPlayer){
          self.handleInputEvent(data);
        }
      });
    
      this.__super();
    },

    /**
    * @function
    * @param {Array} data
    */
    handleInputEvent: function(data) {
      //    console.log('handleInputEvent', JSON.stringify(data));
      if (data[0] == 'play') {
        this.resume();
      } else if (data[0] == 'stop') {
        this.stop();
      } else if (data[0] == 'pause') {
        this.pause();
/*      } else if (data[0] == 'rewind') {
          this.rewind();
      } else if (data[0] == 'forward') {
          this.fastfwd(); */
      } else if (data[0] == 'next') {
        this.playNext();
      } else if (data[0] == 'prev') {
        this.playPrev();
      } else if (data[0] == 'seekTo') {
        this.setCurrentTime(data[1]);
      } else if (data[0] == 'seekBy') {
        this.setCurrentTime(this.getCurrentTime() + data[1]);
      }
    },

    /**
    * @function
    * @param {Object} ev
    */
    error: function(ev) {

      this.errorCode = this.errorCode != 0 ? this.errorCode : ev.srcElement.error.code;
      var errorMessages = this.options.errorMessages || {};

      switch (this.errorCode) {
     //TODO
      }
      this.publish('error', { message: this.message, number: this.errorCode, origin: 'adapters/browser/uielements/video.mediaelement' });
    },

    /**
    * @function
    * @param {Object} target
    * @param {string} eventName
    * @param {Function} listener
    */
    startListening: function(target, eventName, listener) {
      this.listeners[eventName] = listener;
      target.addEventListener(eventName, listener);
    },

    /**
    * @function
    * @param {Object} target
    */
    stopListeningAll: function(target) {

      _.each(this.listeners, function(i, o) {
        try {
          target.removeEventListener(i, o);
        } catch (e) {}
      });
    },

    /**
    * Refresh data in the UIElement
    * @function
    * @param {Function} callback callback when refreshed.
    */
    refresh: function(callback) {
      //Reload the innerTemplate if the element was in loading state
      if (this.htmlIsLoader) {
        this.htmlEl.innerHTML = this.template(this.options.innerTemplate);
        this.htmlIsLoader = false;
      }

      this.publish('afterRefresh');

      if (callback) callback();
    },
    template: function(tpl) {
      this._ = _;
      if (_.isFunction(tpl)) {
        return tpl(this);
      } else {
        return _.template(tpl, this);
      }
    },
    
    /**
    * @function
    * @param {String} status
    */
    setVideoStatus: function(status) {
      this.videoStatus = status;
      this.publish(status);
    },

    /**
    * Play video
    * @function
    * @param {Object} options Hash of options.
    * @param {String} options.url URL of the video.
    * @param {String} options.mime mime type.
    * @param {String} options.image thumbnail.
    * @param {Function} options.cleanup cleaning function.
    * @param {bool} options.forceAspectRatio adapt player to video stream or fixed size ?
    * @param {int} options.width If forceAspectRatio.
    * @param {bool} options.noAutoPlay
    */
    playWithStaticUrl: function(options) {

      var self=this;
     if (!options.url){
      // self.setVideoStatus('error');
       return false;
     }
     
     if (options.img){
       //self.addScreenshot(options.img);
     }
     //retrieving the <object id 
     self.player =document.getElementById(self.htmlId + '_video');
     //options
     if (options.mime) self.player.type = options.mime;
     if (options.fullScreen || options.width){
       self.player.width= options.fullScreen ? Joshfire.deviceInfo.screenWidth : options.width;
     }
     if (options.fullScreen || options.height){
       self.player.height= options.fullScreen ? Joshfire.deviceInfo.screenHeight : options.height;
     }
     
     //video url
     self.player.data=options.url;
     self.setVideoStatus('loading');
     //play
    if (self.player.play){
      self.player.play(1);
    }
    //checking video state      
    self.daemon = setInterval(self.player.onPlayStateChange=function(){self.checkPlayState(self);}, 500);
     return true;
  },
    checkPlayState:function(self){
       switch (self.player.playState)
       {
         case 5: // finished
          if (self.videoStatus!='stopped'){
            self.stop();
          }
          break;
        case 0: // stopped
          if (self.videoStatus!='stopped'){
            self.stop();
          }
          break;
        case 6: // error
          self.stop();
          break;
        case 1: // playing
          if (self.videoStatus!='playing'){
            self.setVideoStatus('playing');
          }
          break;      
        case 2: // paused
          if (self.videoStatus!='paused') self.pause();
          break;
        case 3: // connecting
        case 4: // buffering
          if (self.videoStatus!='loading'){
            self.setVideoStatus('loading');
          }
        default:
          // do nothing
          break;
      }
      return true;
    },
    /**
    * pause a video
    * @function
    *
    */
    pause: function() {
      //add pause overlay
      this.setVideoStatus('paused');
      if (this.player && typeof this.player.play=='function') {
        this.player.play(0);
      }
    },

    /**
    * resume a video
    * @function
    *
    */
    resume: function() {
      this.setVideoStatus('playing');
      if (this.player && typeof this.player.play=='function') {
        this.player.play(1);
      }

    },

    /**
    * stop a video
    * @function
    *
    */
    stop: function() {
      this.setVideoStatus('stopped');
      if (this.player && typeof this.player.stop =='function') {
        this.player.stop();
      }

    },
    /**
    * reset player
    * @function
    **/
    reset:function(){
      this.player=false;
      this.setData(null);
    },
    /**
    *  add screenshot
    * @function
    * @param url {String}
    **/
    addScreenshot:function(url){
      this.htmlEl.innerHTML += '<img src=\''+url+'\' />';
      this.screenshot=this.htmlEl.querySelector('img');
    },
    /**
    * show screen shot
    * @function
    **/
    showScreenshot:function(){
      if (this.screenshot) this.screenshot.style.display='block';
    },
    /**
    * hide screen shot, when video plays
    * @function
    **/
    hideScreenshot:function(self){
      if (!self) self=this;
            if (this.screenshot)  this.screenshot.style.display='none';
    },
    /**
    * remove screenshot
    * @function
    **/
    removeScreenshot:function(){
      if (this.screenshot)      this.htmlEl.removeChild(this.screenshot);
    },
    /**
    * get current time, in seconds
    * @function
    * @return {int}
    */
    getCurrentTime: function() {
      
      if (this.player && this.player.playPosition) return Math.round(this.player.playPosition/1000);  
      return 0;
    },

    /**
    * get video duration, in seconds
    * @function
    * @return {int}
    */
    getTotalTime: function() {
      if (this.player && this.player.playTime){
        return Math.round(this.player.playTime);
      }
      return 0;
    },

    /**
    * @function
    * @param {int} seconds
    */
    setCurrentTime: function(seconds) {
      seconds = Math.max(0, Math.min(seconds, this.getTotalTime()));
      if (this.player && this.player.seek){
        /**
        * Suggested by Sam Berghmans (nspyre)
        * "If the video is already playing, it does not interfere with it."
        **/
        
        this.player.play(1);
        this.player.seek(Math.max(0, 1000*seconds));
      }
    },

    /**
    * @function
    *
    */
    remove: function() {
      
    },

    /**
    * Get element's html, processed via this.template()
    * @function
    * @return {String}
    **/
    getHtml: function() {
      this.htmlInner = this.getInnerHtml();
      this.htmlOuter = this.template(this.options.innerTemplate);
      return this.template(this.options.template);
    },
    /**
        * Returns inner html, depending of the isLoading state
        * @function
        * @return {string} inner html.
        */
    getInnerHtml:function(){
      this.__super();
    },
    
    /**
    * Set player data
    * @function
    */
    setData:function(data){
      if (data && data.url) this.currentUrl = data.url;
      this.__super(data);
    }
  });
});
