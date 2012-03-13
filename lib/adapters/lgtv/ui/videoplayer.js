define([
  'joshlib!uielement',
  'joshlib!utils/dollar',
  'joshlib!vendor/underscore'
],
function(UIElement, $, _) {

  /**
   * Keep the template in here for now.
   * @private
   */
  var template = _.template('<object type="<%= type %>" data="<%= url %>" width="<%= width %>" height="<%= height %>" autostart="<%= autostart ? "true" : "false" %>" downloadable="<%= downloadable ? "true" : "false" %>" preBufferingTime="<%= preBufferingTime %>"></object>');

  /**
   * @private
   */
  var stateToEvent = [
    'stopped',
    'playing',
    'paused',
    'connecting',
    'buffering',
    'finished',
    'error'
  ];

  /**
   * LGAPPTV video player.
   *
   * Triggers events 'stopped', 'playing', 'paused', 'connecting',
   * 'buffering', 'finished', 'error', 'stateChange'
   */
  var UIVideoPlayer = UIElement.extend({

    /**
     * Default options.
     */
    defaults: {
      type: 'application/x-netcast-av',
      width: 640,
      height: 480,
      autostart: false,
      downloadable: false,
      preBufferingTime: 3
    },

    /**
     * Initializes the element.
     *
     * @function
     * @param [Object] a hash of options
     */
    initialize:function(options) {
      UIElement.prototype.initialize.call(this, options);

      options || (options = {});

      this.context = _.extend(this.defaults, options);
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
      this.object && (this.object.onPlayStateChange = null);

      this.object = this.$('object').get(0);

      this.object.onPlayStateChange = _.bind(this.onPlayStateChange, this);

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
    },

    /**
     * Plays the video.
     *
     * @function
     */
    play: function() {
      this.object && this.object.play(1);
    },

    /**
     * Pauses the video.
     *
     * @function
     */
    pause: function() {
      this.object && this.object.play(0);
    },

    /**
     * Stops the video.
     *
     * @function
     */
    stop: function() {
      this.object && this.object.stop();
    },

    /**
     * Plays next video.
     *
     * @function
     */
    next: function() {
      this.object && this.object.next();
    },

    /**
     * Plays previous video.
     *
     * @function
     */
    prev: function() {
      this.object && this.object.prev();
    },

    /**
     * Seek to given position.
     *
     * @function {Integer} position in milliseconds
     */
    seek: function(position) {
      this.object && this.object.seek(position);
    },

    /**
     * Returns length of video.
     *
     * @function {Integer} length in milliseconds
     */
    getLength: function() {
      return this.object ? this.object.playTime : null;
    },

    /**
     * Returns current position of video.
     *
     * @function {Integer} position in milliseconds
     */
    getPosition: function() {
      return this.object ? this.object.playPosition : null;
    },

    /**
     * @private
     */
    onPlayStateChange: function() {
      var eventName = stateToEvent[this.object.playState];

      switch(eventName) {
        case 'playing':
        this.$image && this.$image.hide();
        break;
        case 'finished':
        case 'error':
        this.$image && this.$image.show();
        break;
      }

      this.trigger(eventName);
      this.trigger('stateChange', eventName);
    }

  });;

  return UIVideoPlayer;
});
