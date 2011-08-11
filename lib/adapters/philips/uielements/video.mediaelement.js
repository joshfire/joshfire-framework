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

Joshfire.define(['joshfire/uielements/video', 'joshfire/class', 'joshfire/vendor/zepto-notouch', 'joshfire/vendor/underscore'], function(Video, Class, $, _) {


  /**
  * @class Video component on iOS
  * @name adapters_ios_uielements_video.medialement
  * @augments uielements_video
  */
  return Class(Video, {
    /**
    * @lends adapters_ios_uielements_video.medialement.prototype
    */
     /**
      * Default options:<br /><ul>
      *   <li>innerTemplate {String}: &lt;object&gt;</li>
      * </ul>
      * @function
      * @return {Object} hash of options.
      */
      getDefaultOptions: function() {
        return _.extend(this.__super(), {
          innerTemplate: '<object id="<%=htmlId%>_video"></object>',
          loadingTemplate: 'Loading...'
        });
      },
    /**
    * init
    * @function
    *
    */
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
        if (self.isDefaultPlayer) {
          self.handleInputEvent(data);
        }
      });
      self.subscribe('input', function(ev, data) {
        self.handleInputEvent(data);
      });
    
      //console.log('jquery/video.mediaelement init');
      this.__super();

    },

    /**
    * @function
    * @param {Array} data
    */
    handleInputEvent: function(data) {
      //      console.log('handleInputEvent', JSON.stringify(data));
      if (data[0] == 'play') {
        this.resume();
      } else if (data[0] == 'stop') {
        this.stop();
      } else if (data[0] == 'pause') {
        this.pause();
      } else if (data[0] == 'next') {
        this.playNext();
      } else if (data[0] == 'prev') {
        this.playPrev();
      } else if (data[0] == 'seekTo') {
        this.setCurrentTime(data[1]);
      } else if (data[0] == 'seekBy') {
        this.setCurrentTime(this.getCurrentTime() + data[1]);
      } else if (data[0]=='exit'){
        this.stop();
      } else if (data[0]=='enter'){
        this.videoStatus=='playing' ? this.pause() : this.resume();
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
      if (!this.inserted) return;
      //Reload the innerTemplate if the element was in loading state
      if (this.htmlIsLoader) {
        this.htmlEl.innerHTML = this.template(this.options.innerTemplate);
        this.htmlIsLoader = false;
      }

      this.publish('afterRefresh');

      if (callback) callback();
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
     //console.warn('play with static url', options);
     var self=this;
     if (!options.url){
      // self.setVideoStatus('error');
       return false;
     }
     console.warn(self.htmlId+'_video', document.getElementById(self.htmlId + '_video'))
     self.player = document.getElementById(self.htmlId + '_video');
    
     self.player.data=options.url;
     if (options.mime) self.player.type = options.mime;
     if (options.fullScreen || options.width){
       self.player.width= options.fullScreen ? Joshfire.deviceInfo.screenWidth : options.width;
     }
     if (options.fullScreen || options.height){
        self.player.height= options.fullScreen ? Joshfire.deviceInfo.screenHeight : options.height;
      }

    },

    /**
    * pause a video
    * @function
    *
    */
    pause: function() {
      this.setVideoStatus('paused');
      if (this.player) {
        this.player.pause();
      }
    },

    /**
    * resume a video
    * @function
    *
    */
    resume: function() {
      this.setVideoStatus('playing');
      if (this.player) {
        this.player.play();
      }

    },

    /**
    * stop a video
    * @function
    *
    */
    stop: function() {
      this.setVideoStatus('stopped');
      if (this.player) {
        this.player.pause();
      }

    },

    /**
    * get current time
    * @function
    * @return {int}
    */
    getCurrentTime: function() {
      if (this.player) return this.player.currentTime;
      return 0;
    },

    /**
    * get video duration
    * @function
    * @return {int}
    */
    getTotalTime: function() {
      return this.videoDuration;
    },

    /**
    * @function
    * @param {int} seconds
    */
    setCurrentTime: function(seconds) {
      if (this.player) this.player.setCurrentTime(Math.max(0, seconds));
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
    }
  });
});
