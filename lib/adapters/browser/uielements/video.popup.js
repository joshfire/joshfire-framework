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

Joshfire.define(['joshfire/uielement', 'joshfire/class', 'joshfire/uielements/video'], function(UIElement, Class, Video) {
  /**
  * @class A video, playing in a popup
  * @name adapters_browser_uielements_video.popup
  * @augments uielements_video
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
