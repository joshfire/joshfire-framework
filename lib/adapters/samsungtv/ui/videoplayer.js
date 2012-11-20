
define([
  '../../tv/ui/videoplayer',
  'joshlib!utils/dollar',
  'joshlib!vendor/underscore'
],
function(VideoPlayer, $, _) {

  // On olders tvs, callbacks have to be globals... So this functions attempts
  // to create global functions with a unique name.
  var cbCount = 0;
  var createCb = function(func) {
    var name = 'samsungVideoPlayerCallback' + ++cbCount;
    window[name] = func;
    return name;
  }

  /**
   * Keep the template in here for now.
   * @private
   */

  var template = _.template('');

  /**
   * GoogleTV video player.
   *
   * Triggers events 'stopped', 'playing', 'paused', 'loading',
   * finished', 'error', 'stateChange'
   */
  var UIVideoPlayer = VideoPlayer.extend({

    /**
     * Default options.
     */
    defaults: {
      width: '100%',
      height: '100%',
      autostart: false,
      id: 'video'
    },

    /**
     * Initializes the element.
     *
     * @function
     * @param [Object] a hash of options
     */
    initialize:function(options) {
      // console.log('videoplayer: initialize');

      VideoPlayer.prototype.initialize.call(this, options);

      options || (options = {});

      this.context = _.extend(UIVideoPlayer.prototype.defaults, options);

      this.state = 'ready';
      this.length = 0;
      this.position = 0;
      this.hasPlayed = false;
    },

    hide: function() {
      VideoPlayer.prototype.hide.call(this);

      if(this.object) {
        $(this.object).hide();
      }
    },

    /**
     * Generates the HTML for the element.
     *
     * @function
     * @param [Function] a callback ex: function(err, html) {...}
     */
    generate: function(cb) {
      // console.log('videoplayer: generate');

      var html = template(this.context);

      if(this.context.image) {
        html += '<img src="' + this.context.image + '" />';
      }

      // Webkit uses its own object. Older environments need a global player
      // directly in the HTML (doesn't seem to work when inserting it
      // dynamically).
      if(this.isWebkit()) {
        html += '<object border="0" classid="clsid:SAMSUNG-INFOLINK-PLAYER" style="position:absolute;z-index:9;"></object>';
      }

      cb && cb(null, html);
      // console.log('videoplayer: generated');
    },

    /**
     * DOM enhancements.
     *
     * @function
     */
    enhance: function() {
      // console.log('videoplayer: enhance');

      if(this.isWebkit()) {
        this.object = this.$('object').get(0);
      } else {
        this.object = document.getElementById('samsung-video-player');
        this.object.Stop();
      }

      $(this.object).hide();

      if(this.context.autoPlay) {
        this.play();
      }

      if(this.context.image) {
        this.$image = this.$('img');
      }

      this.resize();

      // Force a second resize...
      setTimeout(_.bind(this.resize, this), 200);

      window.addEventListener('unload', _.bind(function() {
        this.remove();
      }, this), false);
    },

    addEventListeners: function() {
      if(!this.object) return;

      this.object.OnCurrentPlayTime = createCb(_.bind(this.onCurrentPlayTime, this));
      this.object.OnStreamInfoReady = createCb(_.bind(this.onStreamInfoReady, this));
      this.object.OnBufferingStart = createCb(_.bind(this.onBufferingStart, this));
      this.object.OnBufferingProgress = createCb(_.bind(this.onBufferingProgress, this));
      this.object.OnBufferingComplete = createCb(_.bind(this.onBufferingComplete, this));
      this.object.OnRenderError = createCb(_.bind(this.onRenderError, this));
      this.object.OnStreamNotFound = createCb(_.bind(this.onStreamNotFound, this));
      this.object.OnConnectionFailed = createCb(_.bind(this.onConnectionFailed, this));
      this.object.OnNetworkDisconnected = createCb(_.bind(this.onNetworkDisconnected, this));
      this.object.OnRenderingComplete = createCb(_.bind(this.onRenderingComplete, this));
    },

    remove: function() {
      // PROBLEME PARFOIS LA VIDEO NE S'ARRETE PAS QUAND ON QUITTE
      // PROBABLEMENT QUAND LA VIDEO SE CHARGE
      // -> Essayer
      // * this.object && this.object.Stop();
      // * ajouter un flag removed et ne jouer que sur que si la video n'a pas
      //   été detruite.

      /*if (this.object && this.object.SetScreenRect) {
        this.object.SetScreenRect(-1, 0, 0, 0);
      }*/

      // console.log('Removing video');

      if(this.object) {
        this.object.OnCurrentPlayTime = null;
        this.object.OnStreamInfoReady = null;
        this.object.OnBufferingStart = null;
        this.object.OnBufferingProgress = null;
        this.object.OnBufferingComplete = null;
        this.object.OnRenderError = null;
        this.object.OnStreamNotFound = null;
        this.object.OnConnectionFailed = null;
        this.object.OnNetworkDisconnected = null;
        this.object.OnRenderingComplete = null;

        $(this.object).hide();

        if(this.state === 'playing' || this.state === 'loading') {
          try {
            this.object.Stop();
          } catch(e) {}
        }

        this.object = null;
      }

      VideoPlayer.prototype.remove.call(this);
    },

    /**
     * Tells the player to resize itself to the proper dimensions.
     *
     * @function
     */
    resize: function() {
      //var screenHeight = parseInt(windowPlugin.GetScreenRect().split('/')[3], 10);
      //var windowPlugin = document.getElementById('window-plugin');

      // console.log('videoplayer: resize');
      // console.log('videoplayer: window.innerHeight: ' + window.innerHeight);

      var getOffset = function(el) {
          var _x = 0;
          var _y = 0;
          while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
              _x += el.offsetLeft - el.scrollLeft;
              _y += el.offsetTop - el.scrollTop;
              el = el.offsetParent;
          }
          return { top: _y, left: _x };
      };

      var $el = $(this.el);
      var offset = getOffset(this.el);

      var scale = 540 / window.innerHeight;

      /*var windowAPI = $('#window-plugin').get(0);
      var res = windowAPI.GetResolution();

      switch(res) {
        case 5:
        scale = 540 / 720;
        break;
        default:
        scale = .533;
      }*/

      // Temporary hack...
      //if(this.isWebkit()) {
        //scale = .533;
      //}

      var left = this.el.offsetLeft;
      var top = this.el.offsetTop;
      var width = $el.innerWidth();
      var height = $el.innerHeight();

      if(this.$image) {
        this.$image.css({
          position: 'absolute',
          left: left + 'px',
          top: top + 'px',
          width: width + 'px',
          height: height + 'px',
          zIndex: 10
        });
      }

      if(this.isWebkit()) {
        $(this.object).css({
          width: width + 'px',
          height: height + 'px'
        });
      } else {
        $(this.object).css({
          position: 'absolute',
          left: offset.left + 'px',
          top: offset.top + 'px',
          width: width + 'px',
          height: height + 'px'
        });
      }

      try {
        // console.log(offset.left, offset.top, width, height);
        this.object && this.object.SetDisplayArea(
          Math.round(scale * offset.left),
          Math.round(scale * offset.top),
          Math.round(scale * width),
          Math.round(scale * height)
        );
      }
      catch (e){
        //
      }

      if(this.state === 'paused') {
        this.pause();
      }
    },

    /**
     * Preloads the video.
     *
     * @function
     */
    preload: function() {

    },

    /**
     * Plays the video.
     *
     * @function
     */
    play: function() {
      if(!this.object) {
        return;
      };

      $(this.object).show();

      if(this.state === 'paused') {
        this.object.Resume();
      } else if(this.state !== 'loading') {
        if(this.context.url) {
          if(this.state !== 'ready' && this.isWebkit()) {
            //this.render();
            this.hasPlayed = false;
          }
          try{
            if(this.object.Play(this.context.url)) {
              this.addEventListeners();
              //this.object.StartPlayback();
            }
          }
          catch(e){
            //
          }
        };

        this.resize();
      }

      if(this.hasPlayed) {
        this.$image && this.$image.hide();
      } else {
        this.$image && this.$image.show();
      }

      if(this.hasPlayed) {
        this.state = 'playing';
        this.trigger('playing');
        this.trigger('stateChange', 'playing');
      } else {
        this.state = 'loading';
        this.trigger('loading');
        this.trigger('stateChange', 'loading');
      }

      this.previousState = 'playing';
    },

    /**
     * Pauses the video.
     *
     * @function
     */
    pause: function() {
      if(this.state === 'ready' || this.state === 'finished' || this.state === 'stopped' || this.state === 'paused') {
        return;
      }

      if(!this.object) {
        return;
      };

      this.object.Pause();
      this.state = 'paused';
      this.previousState = 'paused';
      this.trigger('paused');
      this.trigger('stateChange', 'paused');

      if(this.hasPlayed) {
        this.$image && this.$image.hide();
      } else {
        this.$image && this.$image.show();
      }
    },

    /**
     * Stops the video.
     *
     * @function
     */
    stop: function() {
      if(this.state === 'ready' || this.state === 'finished' || this.state === 'stopped') {
        return;
      }

      if(!this.object) {
        return;
      };

      this.$image && this.$image.show();

      this.object.Stop();
      $(this.object).hide();

      this.position = 0;
      this.state = 'stopped';
      this.trigger('stopped');
      this.trigger('stateChange', 'stopped');
    },

    /**
     * Plays next video.
     *
     * @function
     */
    next: function() {

    },

    /**
     * Plays previous video.
     *
     * @function
     */
    prev: function() {

    },

    /**
     * Seek to given position.
     *
     * @function {Float} position in seconds
     */
    seek: function(position) {
      if(!this.object) {
        return;
      };

      if(this.state === 'stopped' || this.state === 'finished') {
        return;
      }

      var position = Math.round(position * 1000);
      position = Math.max(0, position);
      position = Math.min(this.length, position);
      var delta = position - this.position;

      if(delta > 0) {
        this.object.JumpForward(delta / 1000);
      } else {
        this.object.JumpBackward(-delta / 1000);
      }
    },

    /**
     * Returns length of video.
     *
     * @returns {Float} length in seconds
     */
    getLength: function() {
      return this.length / 1000;
    },

    /**
     * Returns current position of video.
     *
     * @function {Float} position in seconds
     */
    getPosition: function() {
      return this.position / 1000;
    },

    /**
     * Returns current state of the video.
     *
     * @returns {String} the state of the video
     */
    getState: function() {
      return this.state;
    },

    /**
     * @private
     */
    onCurrentPlayTime: function(ms) {
      // On Samsung 2012, when doing HLS, the duration of the video is periodically updated.
      this.length = this.object.GetDuration();

      if(ms > this.length || isNaN(ms)) {
        if(this.state !== 'finished') {
          this.onRenderingComplete();
        }

        return;
      }

      if(this.state !== 'stopped' && this.state !== 'finished') this.position = ms;
      this.hasPlayed = true;

      if(this.state === 'paused') {
        this.object.Pause();
      }

      if(this.state === 'stopped') {
        this.object.Stop();
      }
    },

    /**
     * @private
     */
    onStreamInfoReady: function() {
      // console.log('stream info ready');
      // console.log(this.object.GetDuration());
      this.length = this.object.GetDuration();
    },

    /**
     * @private
     */
    onBufferingStart: function() {
      if(this.state !== 'loading') {
        this.previousState = this.state;
      }

      this.state = 'loading';
      this.trigger('loading');
      this.trigger('stateChange', 'loading');

      !this.hasPlayed && this.$image && this.$image.hide();

      // console.log('onBufferingStart');
    },

    /**
     * @private
     */
    onBufferingProgress: function() {

    },

    /**
     * @private
     */
    onBufferingComplete: function() {
      this.state = this.previousState;
      this.trigger(this.state);
      this.trigger('stateChange', this.state);

      if(this.previousState === 'stopped' || this.state === 'stopped') {
        this.$image && this.$image.show();
        this.object && this.object.Stop();
      } else if(this.previousState !== 'paused' || this.state !== 'paused') {
        this.$image && this.$image.hide();
      } else {
        this.object && this.object.Pause();
      }

      // console.log('onBufferingProgress');
    },

    /**
     * @private
     */
    onRenderingComplete: function() {

      this.position = 0;

      this.$image && this.$image.show();

      if(this.object) {
        this.object.Stop();
        $(this.object).hide();
      }

      if(this.state !== 'finished') {
        this.state = 'finished';
        this.trigger('finished');
        this.trigger('stateChange', 'finished');
      }

      // console.log('onRenderingComplete');

      /*this.$image && this.$image.show();

      if(this.object) {
        this.object.Stop();
        $(this.object).hide();
      }

      this.position = 0;
      this.state = 'stopped';
      this.trigger('stopped');
      this.trigger('stateChange', 'stopped');*/
    },

    /**
     * @private
     */
    onRenderError: function(err) {
      this.state = 'error';
      this.trigger('error');
      this.trigger('stateChange', 'error');

      this.$image && this.$image.show();

      // console.log('onRenderError ' + err);
    },

    /**
     * @private
     */
    onStreamNotFound: function() {
      this.state = 'error';
      this.trigger('error');
      this.trigger('stateChange', 'error');

      this.$image && this.$image.show();

      // console.log('onStreamNotFound');
    },

    /**
     * @private
     */
    onConnectionFailed: function(err) {
      this.state = 'error';
      this.trigger('error');
      this.trigger('stateChange', 'error');

      this.$image && this.$image.show();

      // console.log('onConnectionFailed ' + err);
    },

    /**
     * @private
     */
    onNetworkDisconnected: function() {
      this.state = 'error';
      this.trigger('error');
      this.trigger('stateChange', 'error');

      this.$image && this.$image.show();

      // console.log('onNetworkDisconnected');
    },

    isWebkit: function() {
      return $.browser.webkit;
    }

  });

  return UIVideoPlayer;
});
