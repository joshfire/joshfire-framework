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

Joshfire.define(['joshfire/uielements/video', 'joshfire/class', 'joshfire/vendor/zepto', 'joshfire/vendor/underscore'], function(Video,Class, $, _) {


  /**
  * @class Video component on iOS for Youtube videos
  * @name adapters_ios_uielements_video.medialement
  * @augments uielements_video
  */
  return Class(Video, {
    /**
    * @lends adapters_ios_uielements_video.medialement.prototype
    */
    /**
    * init
    * @function
    *
    */
    init: function() {

      //console.log('jquery/video.mediaelement init');
      this.__super();

    },

    playWithStaticUrl: function(options) {
      var self = this,
          controls = (self.options.controls) ? ' controls' : '';

      if (self.options.width) {
        var width = self.options.width;
      } else {
        var width = $(this.htmlEl).width();
      }


      //TODO configurable aspect ratio.
      var height = parseInt(width * 9 / 16);

      // Insertion
      this.htmlEl.innerHTML = '<object width=\"' + width + '\" height=\"' + height + '\">' + //
          '<param name=\"movie\" value=\"http://www.youtube.com/v/' + options.url + '&f=gdata_videos\"></param>' +
          '<param name=\"wmode\" value=\"transparent\"></param>' +
          '<embed src=\"http://www.youtube.com/v/' + options.url + '&f=gdata_videos\"' +
          'type=\"application/x-shockwave-flash\" wmode=\"transparent\" width=\"' + width + '\" height=\"' + height + '\"></embed>' + //
          '</object>';

    },

    pause: function() {
      // Can't do that for now.
    },

    stop: function() {
      this.htmlEl.innerHTML = '';
    },

    /**
    * @function
    * @return {string} html.
    */
    getHtml: function() {
      return "<div class='josh-type-" + this.type + "' id='" + this.htmlId + "'></div>";
    }
  });
});
