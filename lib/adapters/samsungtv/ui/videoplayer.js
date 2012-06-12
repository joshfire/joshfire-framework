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

  var template = _.template('<object id="<%= id %>" border=0 classid="clsid:SAMSUNG-INFOLINK-PLAYER"></object><object border=0 classid="clsid:SAMSUNG-INFOLINK-WINDOW"></object>');

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
      this.object = this.$('object').get(0);
      var windowApi = this.$('object').get(1);

      var screenRect = windowApi.GetResolution();

      console.log(screenRect);

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

      if(this.context.image) {
        this.$image = this.$('img');

        this.$image.css({
          position: 'absolute',
          left: this.object.offsetLeft + 'px',
          top: this.object.offsetTop + 'px',
          width: this.object.offsetWidth + 'px',
          height: this.object.offsetHeight + 'px'
        });
      }

      if(this.context.autoPlay) {
        this.play();
      }
    },

    /**
     * Tells the player to resize itself to the proper dimensions.
     *
     * @function
     */
    resize: function() {
      var $el = $(this.el);
      var offset = $el.offset();
      var scale = .533;
      var left = Math.round(offset.left * scale);
      var top = Math.round(offset.top * scale);
      var width = Math.round($el.width() * scale);
      var height = Math.round($el.height() * scale);

      console.log(window.innerWidth, window.innerHeight)
      console.log('resizing', left, top, width, height);

      this.object && this.object.SetDisplayArea(left, top, width, height);
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

        this.$image && this.$image.hide();

        this.state = 'playing';
        this.trigger('playing');
        this.trigger('stateChange', 'playing');
      } else if(this.state === 'ready' || this.state === 'stopped' || this.state === 'finished') {
        this.object && this.context.url && this.object.Play(this.context.url);
        this.resize();

        this.state = 'loading';
        this.trigger('loading');
        this.trigger('stateChange', 'loading');
      }
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
      this.object && this.object.Stop();
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
      return this.length / 1000 || 0;
    },

    /**
     * Returns current position of video.
     *
     * @function {Float} position in seconds
     */
    getPosition: function() {
      return this.position / 1000 || 0;
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
    },

    /**
     * @private
     */
    onRenderingComplete: function() {
      this.state = 'finished';
      this.trigger('finished');
      this.trigger('stateChange', 'finished');

      this.$image && this.$image.show();
    },

    /**
     * @private
     */
    onRenderError: function() {
      this.state = 'error';
      this.trigger('error');
      this.trigger('stateChange', 'error');

      this.$image && this.$image.show();
    },

    /**
     * @private
     */
    onStreamNotFound: function() {
      this.state = 'error';
      this.trigger('error');
      this.trigger('stateChange', 'error');

      this.$image && this.$image.show();
    },

    /**
     * @private
     */
    onConnectionFailed: function() {
      this.state = 'error';
      this.trigger('error');
      this.trigger('stateChange', 'error');

      this.$image && this.$image.show();
    },

    /**
     * @private
     */
    onNetworkDisconnected: function() {
      this.state = 'error';
      this.trigger('error');
      this.trigger('stateChange', 'error');

      this.$image && this.$image.show();
    }

  });

  return UIVideoPlayer;
});
