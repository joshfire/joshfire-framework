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
  var template = _.template('<object id="<%= id %>" type="<%= type %>" data="<%= url %>" width="<%= width %>" height="<%= height %>" autostart="<%= autostart ? "true" : "false" %>" downloadable="<%= downloadable ? "true" : "false" %>" preBufferingTime="<%= preBufferingTime %>"></object>');

  /**
   * @private
   */
  var stateToEvent = [
    'stopped',
    'playing',
    'paused',
    'loading',
    'loading',
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
      type: 'application/x-netcast-av',
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
      this.bufferingProgress = 0;
    },

    /**
     * Tells the player to resize itself to the proper dimensions.
     *
     * @function
     */
    resize: function() {
      //var screenHeight = parseInt(windowPlugin.GetScreenRect().split('/')[3], 10);
      //var windowPlugin = document.getElementById('window-plugin');

      console.log('videoplayer: resize');
      console.log('videoplayer: window.innerHeight: ' + window.innerHeight);

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

      $(this.object).css({
        width: width + 'px',
        height: height + 'px'
      });

      try {
        console.log(offset.left, offset.top, width, height);
        this.object && this.object.SetDisplayArea(
          Math.round(scale * offset.left),
          Math.round(scale * offset.top),
          Math.round(scale * width),
          Math.round(scale * height)
        );
        console.log('resize ok', scale * offset.left, scale * offset.top, scale * width, scale * height)
      } catch(e) {}

      if(this.state === 'paused') {
        this.pause();
      }
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
      this.object && this.object.play && this.object.play(1);
    },

    /**
     * Pauses the video.
     *
     * @function
     */
    pause: function() {
      this.object && this.object.play && this.object.play(0);
    },

    /**
     * Stops the video.
     *
     * @function
     */
    stop: function() {
      this.object && this.object.stop && this.object.stop();
    },

    /**
     * Plays next video.
     *
     * @function
     */
    next: function() {
      this.object && this.object.next && his.object.next();
    },

    /**
     * Plays previous video.
     *
     * @function
     */
    prev: function() {
      this.object && this.object.prev && this.object.prev();
    },

    /**
     * Seek to given position.
     *
     * @param {Float} position in seconds
     */
    seek: function(position) {
      this.object && this.object.seek && this.object.seek(Math.round(position * 1000));
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
     * Returns current buffering progress of the video.
     *
     * @returns {number} the buffering progress (percentage)
     */
    getBufferingProgress: function() {
      if(this.buffering && this.object) {
        this.bufferingProgress = this.object.bufferingProgress;
      }

      return this.bufferingProgress;
    },

    /**
     * @private
     */
    onPlayStateChange: function() {
      if(this.object.playState === 4) {
        this.buffering = true;
      } else {
        this.buffering = false;
      }

      this.state = stateToEvent[this.object.playState];

      //$('#msgbox').show().html('*' + this.state+$('#msgbox').html())

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
