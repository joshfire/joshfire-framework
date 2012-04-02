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
  var template = _.template('TODO');

  

  /**
   * LGAPPTV video player.
   *
   * Triggers events 'stopped', 'playing', 'paused', 'loading',
   * finished', 'error', 'stateChange'
   */
  var UIVideoPlayer = VideoPlayer.extend({

    /**
     * Default options.
     */
    defaults: {
   
    },

    /**
     * Initializes the element.
     *
     * @function
     * @param [Object] a hash of options
     */
    initialize:function(options) {
      VideoPlayer.prototype.initialize.call(this, options);

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
   
    },

    /**
     * Pauses the video.
     *
     * @function
     */
    pause: function() {
     
    },

    /**
     * Stops the video.
     *
     * @function
     */
    stop: function() {
 
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
     * @param {Float} position in seconds
     */
    seek: function(position) {
   
    },

    /**
     * Returns length of video.
     *
     * @returns {Float} length in seconds
     */
    getLength: function() {
    	return 0;
    },

    /**
     * Returns current position of video.
     *
     * @returns {Float} position in seconds
     */
    getPosition: function() {
     return null;
    },

    /**
     * Returns current state of the video.
     *
     * @returns {String} the state of the video
     */
    getState: function() {
      return null;
    }

  });

  return UIVideoPlayer;
});
