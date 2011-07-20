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

Joshfire.define(['joshfire/uielements/video', 'joshfire/class', 'joshfire/vendor/jquery', 'joshfire/vendor/underscore', 'joshfire/vendor/mediaelement'], function(Video, Class, $, _, mejs) {

  /**
  * @class MediaElementJs video backend
  * @name adapters_browser_uielements_video.mediaelement
  * @augments uielements_video
  */
  return Class(Video, /** @lends adapters_browser_uielements_video.mediaelement.prototype */ {

    /**
    * init video
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

      // tweak default configuration of the mediaelement (https://github.com/johndyer/mediaelement/)
      this.MediaElementDefaults = _.clone(mejs.MediaElementDefaults);

      if (typeof this.options['mediaElementDefaultsPluginPath'] === 'string')
        this.MediaElementDefaults.pluginPath = this.options['mediaElementDefaultsPluginPath'];
      else
        this.MediaElementDefaults.pluginPath = '/public/swf/';
      this.MediaElementDefaults.plugins = ['flash'];

      this.__super();

    },

    /**
    * Handle inputs: play, pause, next, seek,..
    * @function
    * @param {Object} data
    */
    handleInputEvent: function(data) {
      //console.log('handleInputEvent', JSON.stringify(data));
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
    * publish the error event with an error message in a span. Default messages can be overwritten
    * @param {DOMElement} [error.srcElement] the video element where the error code resides. Will use <code>this.errorCode</code> if not defined.
    * @see options.errorMessages.aborted
    * @see options.errorMessages.network
    * @see options.errorMessages.decode
    * @see options.errorMessages.notsupported
    * @see options.errorMessages.other
    * @see message
    * @see errorCode
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
    * Register listeners
    * @function
    * @param {Object} target
    * @param {string} eventName
    * @param {Object} listener
    */
    startListening: function(target, eventName, listener) {
      this.listeners[eventName] = listener;
      target.addEventListener(eventName, listener);
    },

    /**
    * Remove listeners
    * @function
    * @param {Object} target
    */
    stopListeningAll: function(target) {

      $.each(this.listeners, function(i, o) {
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
    * Set status
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
    * @param {String} [options.mime] mime type (video/mp4).
    * @param {String} [options.image] thumbnail
    * @param {Function} [options.cleanup] cleaning function.
    * @param {bool} [options.forceAspectRatio] adapt player to video stream or fixed size ?
    * @param {int} [options.width] If forceAspectRatio is true,.
    * @param {bool} [options.noAutoPlay=false].
    * @param {String} [options.pluginPath=../joshfire/adapters/browser/uielements/] where is the flashmediaelement.swf file.
    */
    playWithStaticUrl: function(options) {
      this.playData = options;
      if (options.url === undefined) {
        return this.error(-1);
      }

      var isFLV = options.url.match(/\.flv$/) || options.mime == 'video/flv';

      //try to reuse existing instances because of http://code.google.com/p/chromium/issues/detail?id=68010
      if (this.player && $('#' + this.htmlId + '_video').size()) {

        this.stopListeningAll(this.player);

        if (this.options.cleanup) {
          this.options.cleanup(this);
        }

        try {
          this.player.stop();
        } catch (e) {}

        $('#' + this.htmlId + '_video').attr('src', options.url);
        if (options.image) $('#' + this.htmlId + '_video').attr('poster', options.image);
        $('#' + this.htmlId + '_video').attr('autoplay', isFLV ? false : true);
        $('#' + this.htmlId + '_video').attr('autobuffer', isFLV ? false : true);
        $('#' + this.htmlId + '_video').attr('preload', isFLV ? false : true);
        $('#' + this.htmlId + '_video').css({
          'display': isFLV ? 'none' : 'block'
        });

        $('#' + this.htmlId + ' .me-plugin').remove();



      } else {

        if (isFLV) {
          // No autoplay here because <video src='xxx.flv' autoplay> will start playing on a GoogleTV
          // even if video.canPlayType("video/flv")==""
          $('#' + this.htmlId)[0].innerHTML = "<video id='" + this.htmlId + "_video' src='" + options.url + "' " + (options.image ? "poster='" + options.image + "'" : '') + ' />';
        } else {
          $('#' + this.htmlId)[0].innerHTML = "<video id='" + this.htmlId + "_video' src='" + options.url + "' " + (options.noautoplay ? '' : "autoplay='true'") + ' autobuffer preload ' + (options.image ? "poster='" + options.image + "'" : '') + ' />';
        }
      }

      //(typeof this.options['width'] !== 'undefined') ?


      $('#' + this.htmlId + '_video').css({
        //'width'  : (typeof this.options['width'] !== 'undefined') ? this.options['width'] : '100%',
        //'height' : (typeof this.options['height'] !== 'undefined') ? this.options['height'] : '100%',
        //'width': $('#' + this.htmlId).width() + 'px',
        //'height': $('#' + this.htmlId).height() + 'px',
        'z-index': 0
      });

      if (this.options.forceAspectRatio) {
        if (!this.options.width) {
          $('#' + this.htmlId + '_video').css({
            'height': ($('#' + this.htmlId + '_video').width() / this.options.forceAspectRatio) + 'px'
          });
        }
      }

      var that = this;

      //Pull this in MediaElement later
      /**
      * Pull this in MediaElement later
      * @function
      * @param {Object}
      * @param {Object}
      */
      mejs.HtmlMediaElementShim.myCreate = function(el, o) {
        //console.warn('myCreate');
        // that.MediaElementDefaults
        var options = mejs.MediaElementDefaults = that.MediaElementDefaults,
            htmlMediaElement = (typeof(el) == 'string') ? document.getElementById(el) : el,
            isVideo = (htmlMediaElement.tagName.toLowerCase() == 'video'),
            supportsMediaTag = (typeof(htmlMediaElement.canPlayType) != 'undefined'),
            playback = {
              method: '',
              url: ''
            },
            poster = htmlMediaElement.getAttribute('poster'),
            autoplay = htmlMediaElement.getAttribute('autoplay'),
            preload = htmlMediaElement.getAttribute('preload'),
            prop;

        // extend options
        for (prop in o) {
          options[prop] = o[prop];
        }

        // check for real poster
        poster = (typeof poster == 'undefined' || poster === null) ? '' : poster;
        preload = true;
        autoplay = !that.playData.noautoplay;

        isVideo = true;//false;

        // test for HTML5 and plugin capabilities
        playback = this.determinePlayback(htmlMediaElement, options, isVideo, supportsMediaTag);
        playback.url = htmlMediaElement.getAttribute('src');

        //console.log("AUTO",options["noautoplay"],autoplay,playback,$("#" + this.htmlId)[0].innerHTML);
        //console.log(playback);
        if (playback.method == 'native') {
          // add methods to native HTMLMediaElement
          this.updateNative(htmlMediaElement, options, autoplay, preload, playback);
        } else if (playback.method !== '') {
          // create plugin to mimic HTMLMediaElement
          this.createPlugin(htmlMediaElement, options, isVideo, playback.method, (playback.url !== null) ? mejs.Utility.absolutizeUrl(playback.url).replace('&', '%26') : '', poster, autoplay, preload);
        } else {
          // boo, no HTML5, no Flash, no Silverlight.
          this.createErrorMessage(htmlMediaElement, options, (playback.url !== null) ? mejs.Utility.absolutizeUrl(playback.url) : '', poster);
        }
      };


      mejs.HtmlMediaElementShim.myCreate($('#' + this.htmlId + '_video')[0], {
        //pluginPath: '/swf/',
        videoWidth: $('#' + this.htmlId + '_video').width(),
        videoHeight: $('#' + this.htmlId + '_video').height(),
        pluginWidth: $('#' + this.htmlId + '_video').width(),
        pluginHeight: $('#' + this.htmlId + '_video').height(),

        enablePluginSmoothing: true,

        type: options.mime,
        //mode:"shim",
        //enablePluginDebug:true,
        /**
        * @function
        * @param {String} error
        */
        error: function(e) {
          that.error(e);
        },
        /**
        * @function
        * @param {Object} me
        * @param {Object} domNode
        */
        success: function(me, domNode) {

          that.player = me;

          that.publish('success');

          that.startListening(me, 'progress', function(ev) {

            /*if(me.duration != that.videoDuration)
            that.videoDuration = me.duration;
            */
            var progressTime = 0;
            if (me.bufferedBytes && me.bytesTotal > 0) {
              progressTime = (me.bufferedBytes / me.bytesTotal) * me.duration;
            } else if (me.loaded && me.total > 0) {
              progressTime = (me.loaded / me.total) * me.duration;
            } else if (me.buffered && me.buffered.end) {
              try {
                progressTime = me.buffered.end();
              } catch (e) {}
            }

            /*if(me.duration == that.videoDuration
            && progressTime == that.getCurrentTime())
            return;
            */
            that.publish('progress', [{
              'totalTime': me.duration,
              'bufferedTime': progressTime
            }]);
          });

          that.startListening(me, 'playing', function(ev) {
            that.setVideoStatus('playing');
          });

          that.startListening(me, 'timeupdate', function(ev) {
            that.videoDuration = me.duration;
            that.publish('timeupdate', [{
              'currentTime': me.currentTime,
              'totalTime': me.duration
            }]);
          });

          that.startListening(me, 'ended', function(ev) {
            that.setVideoStatus('stopped');
            that.publish('ended');
            that.playNext();
          });

          that.startListening(me, 'canplay', function(ev) {

            //todo test more
            if (options.position) {
              that.setCurrentTime(options.position);
            }

            if (!options.noautoplay && that.videoStatus != 'playing') {
              me.play();
              that.setVideoStatus('playing');
            }

          });

          that.startListening(me, 'error', function(ev) {
            //ignore errors about the gif img unloader
            if (ev.target.src.match(/\.gif$/)) {
              return;
            }
            that.setVideoStatus('stopped');
            that.error(ev);
          });

        }
      }
      );

      this.setVideoStatus('loading');

    },

    /**
    * pause a video
    * @function
    *
    */
    pause: function() {
      this.setVideoStatus('paused');
      if (this.player) this.player.pause();
    },

    /**
    * resume a video
    * @function
    *
    */
    resume: function() {
      this.setVideoStatus('playing');
      if (this.player) this.player.play();
    },

    /**
    * stop a video
    * @function
    *
    */
    stop: function() {
      this.setVideoStatus('stopped');
      if (this.player) this.player.stop();
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
    * return {int}
    *
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
          //console.log('remove workflow: stopAll', this.id);
          this.stopListeningAll(this.player);
        } catch (e0) {}

        try {
          //console.log('remove workflow: pause', this.id);
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
    * @return {String} html.
    */
    getHtml: function() {
      return "<div class='josh-type-" + this.type + "' id='" + this.htmlId + "'></div>"; //"<div id='" + this.htmlId + "__overlay'></div>";
    }

  });


});
