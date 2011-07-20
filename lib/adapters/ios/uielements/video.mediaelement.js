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

Joshfire.define(['joshfire/uielements/video', 'joshfire/class', 'joshfire/vendor/zepto', 'joshfire/vendor/underscore', 'joshfire/vendor/mediaelement'], function(Video, Class, $, _, mejs) {


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

      // Memory leak fixes
      $(window).bind('unload', function() {
        try {
          self.remove();
        } catch (e) {}
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
        case 1:
          //MEDIA_ERR_ABORTED
          this.message = '<span>' + (errorMessages.aborted || 'The loading of the video was aborted') + '</span>';
          break;
        case 2:
          //MEDIA_ERR_NETWORK:
          this.message = '<span>' + (errorMessages.network || 'A network problem is preventing the video from loading') + '</span>';

          break;
        case 3:
          //MEDIA_ERR_DECODE
          this.message = '<span>' + (errorMessages.decode || 'The video format is not recognized') + '</span>';
          break;
        case 4:
          //MEDIA_ERR_SRC_NOT_SUPPORTED
          //TODO check this error message
          this.message = '<span>' + (errorMessages.notsupported || "The video couldn't be loaded because of a server issue") + '</span>';
          break;
        default:
          this.message = '<span>' + (errorMessages.other || 'Unknown error') + '</span>';
          break;
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
      var self = this,
          controls = (self.options.controls) ? ' controls' : '';

      // Insertion
      $('#' + self.htmlId)[0].innerHTML = '<span class="close">Close</span><video id="' + self.htmlId + '_video" src="' + options.url + '" ' + (options.noautoplay ? '' : 'autoplay="true"') + ' autobuffer preload ' + (options.image ? 'poster="' + options.image + '"' : '') + controls + ' />';
      self.player = document.getElementById(self.htmlId + '_video');

      if (self.player.paused) {
        $('#' + self.player.id).addClass('video-paused');
      }

      // If controls are not displayed, use touch event to play/pause
      if (!controls) {
        var events;

        try {
          document.createEvent('TouchEvent');
          events = 'touchstart MozTouchDown';
        } catch (e) {
          events = 'mousedown';
        }

        $('#' + self.htmlId + ' .close').bind(events, function(e) {
          $('#' + self.htmlId).html('').hide();
        });

        $('#' + self.htmlId + '_video').bind(events, function(e) {
          $('#' + self.player.id).toggleClass('video-paused');
          if (self.player.paused) {
            self.player.play();
          }
          else {
            self.player.pause();
          }
        });
      }



      self.setVideoStatus('loading');
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
      this.playingPath = false;
      //if (typeof this.player != 'undefined')
      if (this.player) {
        try {
          //          console.log('remove workflow: stopAll', this.id);
          this.stopListeningAll(this.player);
        } catch (e0) {}

        try {
          //          console.log('remove workflow: pause', this.id);
          this.player.pause();

        } catch (e1) {}

        try {
          //console.log('remove workflow: stop', this.id);
          this.player.stop();
        } catch (e2) {}

        try {
          //console.log('remove workflow: stopped', this.id);
          this.setVideoStatus('stopped');
        } catch (e3) {}

        try {
          //console.log('remove workflow: src', this.id);
          //this.player.src ='/images/mediaelement/empty.mp4'; // setSrc('/images/mediaelement/empty.mp4'); //data:image/gif;base64,R0lGODlhAQABAJH/AP///wAAAP///wAAACH/C0FET0JFOklSMS4wAt7tACH5BAEAAAIALAAAAAABAAEAAAICVAEAOw==');
          this.player.setSrc('/images/mediaelement/spacer.gif');
          //console.log('remove workflow: load', this.id);
          this.player.load();
        } catch (e4) {}

        try {
          //console.log('remove workflow: restop', this.id);
          this.player.stop();
        } catch (e5) {}

        try {
          //console.log('remove workflow: remove', this.id);
          $(this.player).remove();
        } catch (e6) {}

        try {
          //console.log('remove workflow: delete', this.id);
          delete this.player;
        } catch (e7) {}


      }

      //console.log("REMOVED VIDEO", this.id);
      //$("#"+this.htmlId).html('');
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
