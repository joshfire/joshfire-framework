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

Joshfire.define(['joshfire/uielements/video.mediaelement', 'joshfire/class', 'joshfire/vendor/jquery', 'joshfire/vendor/underscore', 'joshfire/vendor/swfobject'], function(VideoMediaElement, Class, $, _, swfobject) {

  /**
  * @class Youtube SWF video backend
  * @name adapters_browser_uielements_video.youtube.swf
  * @augments uielements_video
  */
  return Class(VideoMediaElement, /** @lends adapters_browser_uielements_video.youtube.swf.prototype */ {

    /**
    * @function init
    *
    */
    init: function() {
      this.embedId = this.htmlId + '_ytembed';
      this.embedInserted = false;
      this.__super();
    },
    /*
    * @function Insert embed youtube video
    * @param {Function} callback
    */

    insertEmbed: function(callback) {
      if (this.embedInserted) {
        //todo if not yet inserted don't callback yet
        callback(null);
        return;
      }
      this.embedInserted = true;

      var self = this;


      // Youtube forces us to put this in the global scope
      // http://code.google.com/apis/youtube/js_api_reference.html
      window.onYouTubePlayerReady = function(playerId) {

        console.log('ytPlayerReady', playerId);

        self.player = document.getElementById(self.embedId);

        var evtListenerGlobalName = 'onYouTubePlayerReady_eventListeners';

        window[evtListenerGlobalName + '_' + playerId + '_onStateChange'] = function(newState) {
          console.log('youtube state', newState);

          if (newState == -1) { //unstarted (=swf loaded)
            self.publish('success');

          } else if (newState == 0) { //ended
            self.setVideoStatus('stopped');
            self.publish('ended');
            self.playNext();

          } else if (newState == 1) { //playing
            self.setVideoStatus('playing');

          } else if (newState == 2) { //paused
            self.setVideoStatus('paused');

          } else if (newState == 3) { //buffering
          /*
          that.videoDuration = me.duration;
          that.publish('progress',[{"totalTime":me.duration,"bufferedBytes":me.bufferedBytes,"totalBytes":me.bytesTotal}]);
          */

          } else if (newState == 5) { //cued
            /*
            ?
            */
          }

        };
        self.player.addEventListener('onStateChange', evtListenerGlobalName + '_' + playerId + '_onStateChange');

        window[evtListenerGlobalName + '_' + playerId + '_onError'] = function(errorCode, err2) {

          console.log('youtube error', errorCode, err2);

          self.setVideoStatus('stopped');

          //TODO better error code mapping
          if (errorCode == 2) {
            self.errorCode = 9; //unsupported
            self.error();
          } else if (errorCode == 100) {
            self.errorCode = 4;
            self.error();
          } else if (errorCode == 101 || errorCode == 150) {
            self.errorCode = 3;
            self.error();
          }

        };
        self.player.addEventListener('onError', evtListenerGlobalName + '_' + playerId + '_onError');

        /*todo settimeout
        that.startListening(me, 'timeupdate', function(ev) {
        that.videoDuration = me.duration;
        that.publish('timeupdate',[{"currentTime":me.currentTime,"totalTime":me.duration,"bufferedBytes":me.bufferedBytes,"totalBytes":me.bytesTotal}]);
        });
        */

        //self.startListening(self.player, 'onPlaybackQualityChange',function(newState) {
        callback(null);

      };

      //this.stopListeningAll(this.player);
      $('#' + this.htmlId).append("<div id='" + this.htmlId + '_inner' + "' >Loading...</div>");

      var params = {
        allowScriptAccess: 'always',
        wmode: 'opaque'
      };
      var atts = {
        id: this.embedId
      };
      /*swfobject.embedSWF("http://www.youtube.com/apiplayer?enablejsapi=1&version=3&playerapiid=joshytplayer_"+_.uniqueId(),
      this.htmlId+"_inner", "100%", "100%", "8", null, null, params, atts);
      */
      
      swfobject.embedSWF('http://www.youtube.com/v/' + self.playData.url + '?enablejsapi=1&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&egm=0&showsearch=0&version=3&playerapiid=joshytplayer_' + _.uniqueId(), this.htmlId + '_inner', '100%', '100%', '8', null, null, params, atts);


      this.setVideoStatus('loading');


    },

    /**
    * @function
    * @param {Object} options
    */
    playWithStaticUrl: function(options) {
      var self = this;
      this.playData = options;

      this.insertEmbed(function(err) {
        self.player.loadVideoById(self.playData.url, 0, self.playData.videoQuality || 'default');
      });

    },

    /**
    * get current time
    * @function
    * @return {int}
    *
    */
    getCurrentTime: function() {
      if (this.player) return this.player.getCurrentTime();
      return 0;
    },

    /**
    * @function
    * @param {int} seconds
    */
    setCurrentTime: function(seconds) {
      if (this.player) this.player.seekTo(seconds);
    },

    /**
    * pause a video
    * @function
    *
    */
    pause: function() {
      this.setVideoStatus('paused');
      if (this.player) this.player.pauseVideo();
    },

    /**
    * stop a video
    * @function
    *
    */
    stop: function() {
      this.setVideoStatus('stopped');
      if (this.player) this.player.stopVideo();
    },

    /**
    * resume a video
    * @function
    *
    */
    resume: function() {
      this.setVideoStatus('playing');
      if (this.player) this.player.playVideo();
    },

    /**
    * Remove a video
    * @function
    *
    */
    remove: function() {
      this.playingPath = false;
      //if (typeof this.player != 'undefined')
      if (this.player) {
        try {
          console.log('remove workflow: stopAll', this.id);
          this.stopListeningAll(this.player);
        } catch (e0) {}

        try {

          this.player.stopVideo();

        } catch (e1) {}

        try {
          console.log('remove workflow: remove', this.id);
          $('ytapiplayer').remove();
        } catch (e2) {}

        try {
          console.log('remove workflow: delete', this.id);
          delete this.player;
        } catch (e3) {}


      }
      console.log('REMOVED VIDEO', this.id);
      //$("#"+this.htmlId).html('');
    }

  });

});
