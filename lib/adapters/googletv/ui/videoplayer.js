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

  var template = _.template('<video id="<%= id %>" src="<%= typeof url!=="undefined" ? url : "" %>" poster="<%= typeof image!=="undefined" ? image : "" %>" <%= autostart ? "autoplay" : "" %>></video>');

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
      width: 640,
      height: 480,
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

      _.bindAll(this, 'onWaiting', 'onCanPlay', 'onPlaying', 'onPlay',
        'onPause', 'onError', 'onEnded');
    },

    /**
     * Generates the HTML for the element.
     *
     * @function
     * @param [Function] a callback ex: function(err, html) {...}
     */
    generate: function(cb) {
      var html = template(this.context);

      cb && cb(null, html);
    },

    /**
     * DOM enhancements.
     *
     * @function
     */
    enhance: function() {
      if(this.object) {
        this.object.removeEventListener('waiting', this.onWaiting);
        this.object.removeEventListener('canplay', this.onCanPlay);
        this.object.removeEventListener('playing', this.onPlaying);
        this.object.removeEventListener('play', this.onPlay);
        this.object.removeEventListener('pause', this.onPause);
        this.object.removeEventListener('error', this.onError);
        this.object.removeEventListener('ended', this.onEnded);
      }

      this.object = this.$('video').get(0);

      this.object.addEventListener('waiting', this.onWaiting);
      this.object.addEventListener('canplay', this.onCanPlay);
      this.object.addEventListener('playing', this.onPlaying);
      this.object.addEventListener('play', this.onPlay);
      this.object.addEventListener('pause', this.onPause);
      this.object.addEventListener('error', this.onError);
      this.object.addEventListener('ended', this.onEnded);

    },

    /**
     * Preloads the video.
     *
     * @function
     */
    preload: function() {
      this.object && this.object.load();
    },

    /**
     * Plays the video.
     *
     * @function
     */
    play: function() {
      this.object && this.object.play();
    },

    /**
     * Pauses the video.
     *
     * @function
     */
    pause: function() {
      this.object && this.object.pause();
    },

    /**
     * Stops the video.
     *
     * @function
     */
    stop: function() {
      this.pause();
      this.seek(0);
      this.state = 'finished';
      this.trigger('finished');
      this.trigger('stateChange', 'finished');
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
      this.object && (this.object.currentTime = position);
    },

    /**
     * Returns length of video.
     *
     * @returns {Float} length in seconds
     */
    getLength: function() {
      return this.object && this.object.duration ? this.object.duration : 0;
    },

    /**
     * Returns current position of video.
     *
     * @function {Float} position in seconds
     */
    getPosition: function() {
      return this.object && this.object.currentTime ?
        this.object.currentTime : 0;
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
    onWaiting: function() {
      this.state = 'loading';
      this.trigger('loading');
      this.trigger('stateChange', 'loading');
    },

    /**
     * @private
     */
    onPlaying: function() {
      this.state = 'playing';
      this.trigger('playing');
      this.trigger('stateChange', 'playing');
    },

    /**
     * @private
     */
    onCanPlay: function() {
      this.state = 'ready';
      this.trigger('ready');
      this.trigger('stateChange', 'ready');
    },

    /**
     * @private
     */
    onPlay: function() {
      this.state = 'playing';
      this.trigger('playing');
      this.trigger('stateChange', 'playing');
    },

    /**
     * @private
     */
    onPause: function() {
      if(this.state !== 'finished') {
        this.state = 'paused';
        this.trigger('paused');
        this.trigger('stateChange', 'paused');
      }
    },

    /**
     * @private
     */
    onError: function() {
      this.state = 'error';
      this.trigger('error');
      this.trigger('stateChange', 'error');
    },

    /**
     * @private
     */
    onEnded: function() {
      if(this.state !== 'finished') {
        this.state = 'finished';
        this.trigger('finished');
        this.trigger('stateChange', 'finished');
      }
    }

  });

  return UIVideoPlayer;
});
