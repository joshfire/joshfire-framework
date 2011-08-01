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

Joshfire.define(['joshfire/uielements/video', 'joshfire/class', 'joshfire/vendor/zepto-notouch', 'joshfire/vendor/underscore', 'joshfire/vendor/mediaelement'], function(Video, Class, $, _, mejs) {


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
    * init
    * @function
    *
    */
    init: function() {

      // Event listeners
      this.listeners = {};

      // Should have an HTML5 <video>-like API
      this.player = false;

      // Status of the video
      this.videoStatus = false;

      // Current video duration
      this.videoDuration = 0;

      var self = this;
      this.app.subscribe('input', function(ev, data) {
        if (self.isDefaultPlayer) {
          self.handleInputEvent(data);
        }
      });


      this.subscribe('input', function(ev, data) {
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
    * @ignore
    * @function refresh
    *
    */
    refresh: function() {

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
     mylog('play with static url');
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
      mylog('remove player');
    },

    /**
    * @function
    * @return {string} html.
    */
    getHtml: function() {
      return "<div class='josh-type-" + this.type + "' id='" + this.htmlId + "'></div>";
    }
  });
});
