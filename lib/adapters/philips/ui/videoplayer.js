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
  var template = _.template('<object id="<%= id %>" type="<%= type %>" data="<%= url %>" width="<%= width %>" height="<%= height %>"></object>');

  /**
   * @private
   */
  var stateToEvent = [
    'stopped',
    'playing',
    'paused',
    'loading', //connecting
    'loading', //buffering
    'finished',
    'error'
  ];
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
      type: 'video/mpeg4',
      width: 640,
      height: 480,
      autostart: false,
      downloadable: false,
      preBufferingTime: 3,
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
      this.lastLength = .0;
      this.lastPosition = .0;
      this.autostart = options.autostart;
			console.log("autostart:" + this.autostart);
    },

    /**
     * Generates the HTML for the element.
     *
     * @function
     * @param [Function] a callback ex: function(err, html) {...}
     */
    generate: function(cb) {
      var html = ""; // template(this.context);

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

      // this.object = this.$('object').get(0);
			this.object = document.getElementById('philips-video-player');
			$(this.object).attr('data', this.context.url)

			console.log('Url:' + this.context.url);

      this.object.onPlayStateChange = _.bind(this.onPlayStateChange, this);

      if(this.context.image) {
        this.$image = this.$('img');

        this.$image.css({
					position: 'absolute',
					left: '0',
					top: '0',
					width: '100%',
					height: '100%'
				});
      }

			$(this.object).css({
				position: 'absolute',
				left: '0',
				top: '0',
				width: '100%',
				height: '100%'
			});

      if(this.autostart) {
				console.log('doing this.play()');
        this.play();
      }
    },

		remove: function() {
      this.object && this.object.stop();
			$(this.object).attr('style', '');
		},

    /**
     * Plays the video.
     *
     * @function
     */
    play: function() {
			console.log('in play');
			this.object.play(1);
			// var that = this;

			// $(that.object).attr('data', $(this.object).attr('data'));
			// $(that.object).show();

			// setTimeout(function() {
			// 	if ($(that.object)[0].play) {
			// 		console.log('no way?');
			// 		$(that.object)[0].play(1);
			// 	} else {
			// 		console.log('told u');
			// 	}
			// }, 2000);
    },

    /**
     * Pauses the video.
     *
     * @function
     */
    pause: function() {
			console.log('in pause');
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
     * @param {Float} position in seconds
     */
    seek: function(position) {
      this.object && this.object.seek(Math.round(position * 1000));
    },

    /**
     * Returns length of video.
     *
     * @returns {Float} length in seconds
     */
    getLength: function() {
      // There seems to be a bug in the LGTV video object.
      // If it is buffering, trying to access the playTime or playPosition
      // properties seems to prevent the video from loading properly, at
      // least in the emulator.
      if(this.object && this.state !== 'loading') {
        this.lastLength = this.object.playTime / 1000.0;
      }

      return this.lastLength;
    },

    /**
     * Returns current position of video.
     *
     * @returns {Float} position in seconds
     */
    getPosition: function() {
      if(this.object && this.state !== 'loading') {
        this.lastPosition = this.object.playPosition / 1000.0;
      }

      return this.lastPosition;
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
    onPlayStateChange: function() {
			console.log("onPlayStateChange");
      this.state = stateToEvent[this.object.playState];

      switch(this.state) {
        case 'playing':
        this.$image && this.$image.hide();
        break;
        case 'finished':
        case 'error':
        case 'stopped':
        this.$image && this.$image.show();
        break;
      }

      this.trigger(this.state);
      this.trigger('stateChange', this.state);
    }

  });

  return UIVideoPlayer;
});
