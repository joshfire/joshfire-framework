/*!
 * Joshfire Framework 0.9.0
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jun 29 16:25:37 2011
 */


Joshfire.define(['joshfire/uielement', 'joshfire/class', 'joshfire/uielements/video'], function(UIElement, Class, Video) {
  /**
  * @class A video, playing in a popup
  * @name adapters_browser_uielements_video.popup
  * @extends uielements_video
  */
  return Class(Video,
      /**
      * @lends adapters_browser_uielements_video.popup.prototype
      */
      /*
      * Open the video in a new window
      * @param {Object} options Hash of options
      * @param {String} options.url
      */
      play : function(options) {
        window.open(options.url);
      }
});
});
