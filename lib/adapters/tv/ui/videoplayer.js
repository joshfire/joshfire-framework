define([
  'joshlib!uielement',
  'joshlib!inputs/remote',
  'joshlib!utils/dollar',
  'joshlib!vendor/underscore'
],
function(Element, Remote, $, _) {

  /**
   * TV abstract video player.
   *
   * Triggers events 'stopped', 'playing', 'paused', 'loading',
   * finished', 'error', 'stateChange'
   */
  var UIVideoPlayer = Element.extend({

    /**
     * Default options.
     */
    defaults: {
      rewindTime: 30,
      fastForwardTime: 30
    },

    /**
     * Initializes the element.
     *
     * @function
     * @param [Object] a hash of options
     */
    initialize: function(options) {
      Element.prototype.initialize.call(this, options);

      options || (options = {});

      options = _.extend(UIVideoPlayer.prototype.defaults, options);

      this.remote = options.remote;
      this.rewindTime = options.rewindTime;
      this.fastForwardTime = options.fastForwardTime;
    },

    /**
     * Rewinds the video.
     *
     * @function
     */
    rewind: function() {
      this.seek(Math.max(0, this.getPosition() - this.rewindTime));
    },

    /**
     * Fast forwards the video.
     *
     * @function
     */
    fastForward: function() {
      this.seek(Math.min(this.getLength(), this.getPosition() +
        this.fastForwardTime));
    },

    /**
     * Enables remote controls.
     *
     * @function
     */
    enableRemote: function() {
      this.remote || (this.remote = new Remote);

      this.remote.bind('press:play', this.onRemotePlay, this);
      this.remote.bind('press:stop', this.onRemoteStop, this);
      this.remote.bind('press:pause', this.onRemotePause, this);
      this.remote.bind('press:rewind', this.onRemoteRewind, this);
      this.remote.bind('press:fast_fwd', this.onRemoteFastForward, this);
    },

    /**
     * Disables remote controls.
     *
     * @function
     */
    disableRemote: function() {
      this.remote.unbind('press:play', this.onRemotePlay);
      this.remote.unbind('press:stop', this.onRemoteStop);
      this.remote.unbind('press:pause', this.onRemotePause);
      this.remote.unbind('press:rewind', this.onRemoteRewind);
      this.remote.unbind('press:fast_fwd', this.onRemoteFastForward);
    },

    /**
     * Plays the video.
     *
     * @function
     * @abstract
     */
    play: function() {
    },

    /**
     * Pauses the video.
     *
     * @function
     * @abstract
     */
    pause: function() {
    },

    /**
     * Stops the video.
     *
     * @function
     * @abstract
     */
    stop: function() {
    },

    /**
     * Plays next video.
     *
     * @function
     * @abstract
     */
    next: function() {
    },

    /**
     * Plays previous video.
     *
     * @function
     * @abstract
     */
    prev: function() {
    },

    /**
     * Seek to given position.
     *
     * @param {Float} position in seconds
     * @abstract
     */
    seek: function(position) {
    },

    /**
     * Returns length of video.
     *
     * @returns {Float} length in seconds
     * @abstract
     */
    getLength: function() {
    },

    /**
     * Returns current position of video.
     *
     * @returns {Float} position in seconds
     * @abstract
     */
    getPosition: function() {
    },

    /**
     * Returns current state of the video.
     *
     * @returns {String} the state of the video
     * @abstract
     */
    getState: function() {
    },

    /**
     * @private
     */
    onRemotePlay: function() {
      this.play();
    },

    /**
     * @private
     */
    onRemoteStop: function() {
      this.stop();
    },

    /**
     * @private
     */
    onRemotePause: function() {
      this.pause();
    },

    /**
     * @private
     */
    onRemoteRewind: function() {
      this.rewind();
    },

    /**
     * @private
     */
    onRemoteFastForward: function() {
      this.fastForward();
    }

  });

  return UIVideoPlayer;
});
