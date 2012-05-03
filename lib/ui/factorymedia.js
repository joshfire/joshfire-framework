/**
 * @fileoverview The FactoryMedia view wraps the mediaplayerlib library,
 * allowing to produce views that include an audio/video element.
 *
 * The actual markup used to produce the audio/video element depends
 * on the model to render and gets returned by mediaplayerlib.
 *
 * To work properly, the view needs to know the dimensions of the media
 * element to render. These dimensions need to be provided as parameters.
 * There are different ways to do so:
 *
 * 1. If the mediaOptions property contains a "width" and a "height"
 * properties set to numbers, the view will simply use that.
 *
 * 2. If the mediaOptions property contains a "width" and a "height"
 * properties set to percentages, the view will compute the actual dimensions
 * from the dimensions of the view element, known from:
 *  a) the "width" and "height" properties of the options object
 *  b) or the dimensions of the DOM element associated with the view,
 *     but note this only works provided that the dimensions of this element
 *     are already set, which usually only occurs when the element is inserted
 *     in the DOM for real
 *     (typically not the case when the view is rendered for the first time)
 *
 * Whatever the method, if the mediaOptions property also contains an
 * "adjustSize" property, the view tells the mediaplayerlib to adjust the
 * dimensions of the video element within the given dimensions to preserve
 * the aspect ratio (you would think that all Web browsers would take care
 * of preserving the aspect ratio, wouldn't you? Well, the default Android
 * browser doesn't quite do that and may not be the only one).
 *
 * An example:
 *  var view = new FactoryMedia({
 *    width: 500,         // Total width available for the view
 *    height: 281,        // Total height available for the view
 *    mediaOptions: {
 *      strategy: "html5",// Mediaplayerlib strategy for the element
 *      width: "100%",    // Video may take up the whole available width
 *      height: "80%"     // Video may take up to 80% of the available height
 *      adjustSize: true  // Adjust video element size to preserve ratio
 *    }
 *  });
 *
 * The view exposes the options and the actual dimensions of the media element
 * in the template's context when rendering the view, allowing to adjust
 * section's heights accordingly. On top of the usual "model" and "item", the
 * HTML template will receive the following structure (some of these properties
 * may not be set):
 *  "media": {
 *    "html": [the HTML markup of the media element],
 *    "metadata": {
 *      "width": [actual media width],
 *      "height": [actual media height]
 *    }
 *  },
 *  "width": [view width, same as initial value],
 *  "height": [view height, same as initial value
 */

/*global define*/

define(['joshlib!ui/item','joshlib!utils/mediaplayerlib','joshlib!utils/dollar','joshlib!vendor/underscore'], function(UIItem,mediaFactory,$,_) {

  /**
   * FactoryMedia extends UIItem, meaning it may be associated with a model
   * and and HTML template.
   *
   * @class
   */
  var UIFactoryMedia = UIItem.extend({
    /**
     * Initializes the view from given options.
     *
     * Overrides base class to keep a pointer on media options
     * @function
     */
    initialize: function(options) {
      this.mediaOptions = options.mediaOptions || {};
      UIItem.prototype.initialize.call(this, options);
    },


    /**
     * Generates the view's HTML content that matches the underlying model.
     *
     * Overrides base implementation to:
     * 1. compute the dimensions of the video element to generate
     * 2. call mediaplayerlib to generate the HTML markup of the media element.
     *
     * @function
     * @param {function} cb Callback function
     */
    generate: function(cb) {
      var rePercentage = /^([0-9]{1,3})%$/;
      var match = null;
      var percentage = 0;
      var mediaOptions = _.clone(this.mediaOptions);

      // No associated model? Nothing to render!
      if(!this.model) return cb(null, '');

      // Compute the requested media element width
      if (mediaOptions.width && _.isString(mediaOptions.width)) {
        match = mediaOptions.width.match(rePercentage);
        if (match) {
          percentage = parseInt(match[1], 10);
          if (this.options.width) {
            mediaOptions.width = this.options.width * percentage / 100;
          }
          else {
            mediaOptions.width = $(this.el).width() * percentage / 100;
          }
          mediaOptions.width = Math.floor(mediaOptions.width);
        }
      }
      if (mediaOptions.height && _.isString(mediaOptions.height)) {
        match = mediaOptions.height.match(rePercentage);
        if (match) {
          percentage = parseInt(match[1], 10);
          if (this.options.height) {
            mediaOptions.height = this.options.height * percentage / 100;
          }
          else {
            mediaOptions.height = $(this.el).height() * percentage / 100;
          }
          mediaOptions.height = Math.floor(mediaOptions.height);
        }
      }

      // Generate the HTML for the media element
      var builder = mediaFactory.resolve(this.model.toJSON(), mediaOptions);
      builder.toHtml(_.bind(function (err, html, metadata) {
        if (this.template) {
          // Note properties put in "data" are exposed to the HTML template
          _.extend(this.data, {
            media: {
              html: html,
              metadata: metadata
            },
            width: this.options.width,
            height: this.options.height
          });

          // Let the base class handle the actual generation
          UIItem.prototype.generate.call(this, cb);
        }
        else {
          // No HTML template? Let's return the HTML of the media element
          return cb(null, html);
        }
      }, this));
    }
  });

  return UIFactoryMedia;
});
