/**
 * @fileoverview Simple image loader view.
 *
 * Use this view to render a spinner while an image is loaded in the
 * background. The view simply adds a "loading" class name to the view's
 * element, delegating possible transitions and spinners to CSS.
 *
 * Pass a "getImageUrl" function as an option so that the view may
 * compute the URL to be loaded in the background.
 *
 * Pass an "imageContainer" property to pass the optional selector to the
 * element that is to receive the "loading" class.
 *
 * The image URL is passed to the view's template as an "imageUrl" parameter.
 *
 * Internally, this view extends ImagesLoader to provide shortcuts to handle
 * only one image.
 */

define([
  'joshlib!ui/imagesloader',
  'joshlib!vendor/underscore',
  'joshlib!utils/i18n'
], function (UIImagesLoader, _, i18n) {

  var UIImageLoader = UIImagesLoader.extend({

    initialize: function(options) {
      // Build the "getImages" function for the underlying ImagesLoader
      // class using getImageUrl and imageContainer.

      // Set the getImageUrl function if given as parameter,
      // look for an imageUrl on the underlying view's model otherwise
      this.getImageUrl = options.getImageUrl || function() {
        if(!this.model) return null;
        return this.model.imageUrl;
      };

      var self = this;
      options.getImages = function () {
        var $el = null;
        if (options.imageContainer) {
          $el = self.$(options.imageContainer);
        }
        if (!$el) {
          $el = self.$el;
        }
        return [{
          el: $el.get(0),
          url: self.getImageUrl()
        }];
      };

      // Call the base class constructor
      UIImagesLoader.prototype.initialize.call(this, options);
    },

    /**
     * Override default generate function to expose the imageUrl parameter
     *
     * @function
     */
    generate: function(cb) {
      if (!this.model) { cb(null, ''); return; }

      var context = {
        model:    this.model,
        obj:      this.model,
        item:     this.model ? this.model.toJSON() : {},
        imageUrl: this.getImageUrl.call(this),
        T:        i18n.getText
      };
      _.extend(context, this.data);

      cb(null, this.template(context));
    }
  });

  return UIImageLoader;
});