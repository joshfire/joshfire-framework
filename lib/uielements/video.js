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

Joshfire.define(['joshfire/uielement', 'joshfire/class'], function(UIElement, Class) {
  /**
  * A video, with basic interactions : play, pause, ..
  * @class Video base class
  * @name uielements_video
  * @augments uielement
  */
  return Class(UIElement,
      /**
      * @lends uielements_video.prototype
      */
      {
        type: 'Video',
        // set to false if you need a video element that will not receive the multimedia events (in the case of multiple videos in the same app)
        isDefaultPlayer: true,
        /**
        * @ignore
        *
        */
        init: function() {},

        /**
        * Play a video
        * @function
        * @param {Object} options Options hash.
        *
        */
        play: function(options) {
          if (!options || !options.url) {
            //good things come to those who wait.. No video yet
            return;
          }
          var self = this;
          if (typeof options.url == 'function') {
            options.url(function(error, url) {
              if (error) {
                return self.error(4);
              }
              options.url = url;
              self.playWithStaticUrl(options);
            });
          } else {
            return self.playWithStaticUrl(options);
          }
        },

        /**
        * Play prev video
        * @function
        *
        */
        playPrev: function() {},

        /**
        * Play next video
        * @function
        *
        */
        playNext: function() {
          var that = this;

          var playlistNextMoves = that.app.tree.getData(that.treeCurrent).playlistNext || ['next'];

          // console.log('playlistNextMoves', that.treeCurrent, that.app.tree.getData(that.treeCurrent).playlistNext, JSON.stringify(playlistNextMoves));
          that.app.tree.resolveMoves(that.treeCurrent, playlistNextMoves, false, function(newPath) {
            // console.log('new path', newPath);
            that.app.tree.moveTo('focus', newPath);
            that.app.publish('input', ['enter']);
          });
        },

        /**
        * Pause the video
        * @function
        */
        pause: function() {
          return;
        },

        /**
        * @function refresh
        *
        */
        refresh: function() {},

        /**
        * @function
        *
        */
        getHtml: function() {
          return '';
        }
      });
});
