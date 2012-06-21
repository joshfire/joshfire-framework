define([
  '../../tv/ui/videoplayer',
  'joshlib!utils/dollar',
  'joshlib!vendor/underscore'
],
function(VideoPlayer, $, _) {

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
      VideoPlayer.prototype.initialize.call(this, options);

      options || (options = {});

      this.context = _.extend(UIVideoPlayer.prototype.defaults, options);

      this.state = 'ready';
      this.length = 0;
      this.position = 0;
    },

    /**
     * Generates the HTML for the element.
     *
     * @function
     * @param [Function] a callback ex: function(err, html) {...}
     */
    generate: function(cb) {
      var html = template(this.context);

      if(this.context.image) {
        html += '<img src="' + this.context.image + '" />';
      }

      cb && cb(null, html);
    },

    /**
     * DOM enhancements.
     *
     * @function
     */
    enhance: function() {
      this.object = document.getElementById('samsung-video-player');

      // Notes: events are not fired by the emulator.
      this.object.OnCurrentPlayTime = _.bind(this.onCurrentPlayTime, this);
      this.object.OnStreamInfoReady = _.bind(this.onStreamInfoReady, this);
      this.object.OnBufferingStart = _.bind(this.onBufferingStart, this);
      this.object.OnBufferingProgress = _.bind(this.onBufferingProgress, this);
      this.object.OnBufferingComplete = _.bind(this.onBufferingComplete, this);
      this.object.OnRenderError = _.bind(this.onRenderError, this);
      this.object.OnStreamNotFound = _.bind(this.onStreamNotFound, this);
      this.object.OnConnectionFailed = _.bind(this.onConnectionFailed, this);
      this.object.OnNetworkDisconnected = _.bind(this.onNetworkDisconnected, this);
      this.object.OnRenderingComplete = _.bind(this.onRenderingComplete, this);

      this.object.Stop();

      if(this.context.image) {
        this.$image = this.$('img');

        this.$image.css({
          position: 'absolute',
          left: this.el.offsetLeft + 'px',
          top: this.el.offsetTop + 'px',
          width: this.el.offsetWidth + 'px',
          height: this.el.offsetHeight + 'px'
        });
      }

      if(this.context.autoPlay) {
        this.play();
      }

      this.resize();
    },

    /**
     * Tells the player to resize itself to the proper dimensions.
     *
     * @function
     */
    resize: function() {
      var $el = $(this.el);
      var offset = $el.offset();
      var scale = 540 / 720;//.533;
      var left = this.el.offsetLeft;
      var top = this.el.offsetTop;
      var width = $el.innerWidth();
      var height = $el.innerHeight();

      console.log(window.innerWidth, window.innerHeight)
      console.log('resizing', left, top, width, height);

      $(this.object).css({
        position: 'absolute',
        left: left + 'px',
        top: top + 'px',
        width: width + 'px',
        height: height + 'px'
      });

      this.object && this.object.SetDisplayArea(
        Math.round(scale * left),
        Math.round(scale * top),
        Math.round(scale * width),
        Math.round(scale * height)
      );

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
      if(this.state === 'paused') {
        this.object && this.object.Resume();
      } else if(this.state === 'ready' || this.state === 'stopped' || this.state === 'finished') {
        this.object && this.context.url && this.object.Play(this.context.url);
        this.resize();
      }

      this.object && $(this.object).show();

      this.$image && this.$image.hide();

      this.state = 'playing';
      this.trigger('playing');
      this.trigger('stateChange', 'playing');
    },

    /**
     * Pauses the video.
     *
     * @function
     */
    pause: function() {
      this.object && this.object.Pause();
      this.state = 'paused';
      this.trigger('paused');
      this.trigger('stateChange', 'paused');

      this.$image && this.$image.hide();
    },

    /**
     * Stops the video.
     *
     * @function
     */
    stop: function() {
      this.object && this.object.Stop() && $(this.object).hide();
      this.position = 0;
      this.state = 'stopped';
      this.trigger('stopped');
      this.trigger('stateChange', 'stopped');

      this.$image && this.$image.show();
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
      var position = Math.round(position * 1000);
      position = Math.max(0, position);
      position = Math.min(this.length, position);
      var delta = position - this.position;

      if(delta > 0) {
        this.object && this.object.JumpForward(delta / 1000);
      } else {
        this.object && this.object.JumpBackward(-delta / 1000);
      }
    },

    /**
     * Returns length of video.
     *
     * @returns {Float} length in seconds
     */
    getLength: function() {
      return this.length;
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
      if(this.state !== 'stopped') this.position = ms;
    },

    /**
     * @private
     */
    onStreamInfoReady: function() {
      console.log('stream info ready');
      console.log(this.object.GetDuration());
      this.length = this.object.GetDuration();
    },

    /**
     * @private
     */
    onBufferingStart: function() {
      this.state = 'loading';
      this.trigger('loading');
      this.trigger('stateChange', 'loading');

      console.log('onBufferingStart');
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
      this.state = 'playing';
      this.trigger('playing');
      this.trigger('stateChange', 'playing');

      this.$image && this.$image.hide();

      console.log('onBufferingProgress');
    },

    /**
     * @private
     */
    onRenderingComplete: function() {
      this.state = 'finished';
      this.trigger('finished');
      this.trigger('stateChange', 'finished');

      this.$image && this.$image.show();

      this.object && $(this.object).hide();

      console.log('onRenderingComplete');
    },

    /**
     * @private
     */
    onRenderError: function() {
      this.state = 'error';
      this.trigger('error');
      this.trigger('stateChange', 'error');

      this.$image && this.$image.show();

      console.log('onRenderError');
    },

    /**
     * @private
     */
    onStreamNotFound: function() {
      this.state = 'error';
      this.trigger('error');
      this.trigger('stateChange', 'error');

      this.$image && this.$image.show();

      console.log('onStreamNotFound');
    },

    /**
     * @private
     */
    onConnectionFailed: function() {
      this.state = 'error';
      this.trigger('error');
      this.trigger('stateChange', 'error');

      this.$image && this.$image.show();

      console.log('onConnectionFailed');
    },

    /**
     * @private
     */
    onNetworkDisconnected: function() {
      this.state = 'error';
      this.trigger('error');
      this.trigger('stateChange', 'error');

      this.$image && this.$image.show();

      console.log('onNetworkDisconnected');
    }

  });

  return UIVideoPlayer;
});
