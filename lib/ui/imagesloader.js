/**
 * @fileoverview Simple images loader view.
 *
 * Use this view to render a spinner while images of an item are loaded in the
 * background. The view simply adds a "loading" class name to identified images
 * within the element, delegating possible transitions and spinners to CSS.
 *
 * Typically, to display a spinner and transition the image into view
 * with a fade-in effect:
 *
 * 1. the view's template should include something like:
 *  <figure>
 *    <div class="image" style="background-image:url('<%= imageUrl %>')"></div>
 *    <div class="spinner"></div>
 *  </figure>
 *
 * 2. and the CSS should be something like:
 *  // Anchor spinner position in <figure>
 *  figure {
 *   position: relative;
 *   width: 100%;   // Adjust to suit your needs
 *   height: 100%;  // Adjust to suit your needs
 *  }
 *
 *  // Define image box and display transition
 *  figure > .img {
 *   background-size: cover;
 *   background-position: center center;
 *   .transition(.7s ease-in-out all);
 *   -webkit-backface-visibility: hidden; // To avoid flickering on iOS
 *  }
 *
 *  // Center spinner in image box, not rendered by default
 *  // (adjust background color and image to suit your needs)
 *  .loader {
 *   background: rgba(0,0,0,.9) url(images/spinner.gif) no-repeat center center;
 *   margin: 0;
 *   position: absolute;
 *   top: 0;
 *   left: 0;
 *   width: 100%;
 *   height: 100%;
 *   z-index: 2;
 *   display: none;
 *  }
 *
 *  // When "loading" is there, image is transparent and spinner is displayed
 *  figure.loading .img {
 *   opacity: 0;        // Also add prefixed versions
 *   transition: none;  // Also add prefixed versions
 *  }
 *  figure.loading .loader {
 *   display: block;
 *  }
 *
 * By default, the images loader extracts <img> tags from the HTML content
 * of the view to use as the list of images to load. You may override that
 * behavior by specifyig a "getImages" function. That function must return
 * an array of objects, each object having the properties:
 *  - el: the DOM element of the image (or the image container) that will
 *  receive the "loading" class while the image is being loaded
 *  - url: the URL of the image to load
 *
 * Pass an "imageClass" property if you're using the default images extractor
 * and would like extracted images to be flagged with a class.
 *
 * Pass a "processImageEl" function if you would like to process extracted
 * images somehow, e.g. to reproduce the image loader markup mentioned above.
 * The function must return the resulting DOM element.
 */

define([
  'joshlib!ui/item',
  'joshlib!utils/dollar',
  'joshlib!vendor/underscore'
], function (UIItem, $, _) {

  var UIImagesLoader = UIItem.extend({

    initialize: function (options) {
      // Class added to all images during extraction when default
      // extractor is used.
      this.imageClass = options.imageClass;

      // Process image function
      this.processImageEl = options.processImageEl;

      // Set the image extractor if defined, or use default one
      var self = this;
      this.getImages = options.getImages || function () {
        // BEWARE: $.map('img', blah) is different from $('img').map(blah)
        // in Zepto 1.0rc1 (the order of parameters is not the same).
        // Use $.map for a consistent behavior between Zepto and jQuery
        var images = $.map(this.$('img'), function (el) {
          if (self.imageClass) $(el).addClass(self.imageClass);
          return {
            el: el,
            url: $(el).attr('src')
          };
        });
        return images;
      };

      // We'll trigger the load event once all images are loaded
      this.customLoadEvent = true;

      // Call the base class constructor
      UIItem.prototype.initialize.call(this, options);
    },

    /**
     * Override the base "enhance" function to extract the images
     * that need to be loaded and start loading in the background.
     *
     * @function
     */
    enhance: function() {
      var self = this;

      if (!this.getImages) {
        UIItem.prototype.enhance.call(this);
        this.trigger('load');
        return;
      }

      // Extract the images to load
      var images = this.getImages();
      if (!images || (images.length === 0)) {
        // No image to load, we're done
        UIItem.prototype.enhance.call(this);
        this.trigger('load');
        return;
      }

      // Load the images in the background and trigger the 'load'
      // event in the background.
      var imagesLoaded = 0;
      var imageLoaded = function (imageEl) {
        if (imageEl) $(imageEl).removeClass('loading');
        imagesLoaded += 1;
        if (imagesLoaded === images.length) {
          // All images have been loaded
          self.trigger('load');
        }
      };
      _.each(images, function (image) {
        if (!image.el || !image.url) {
          return imageLoaded(image.el);
        }
        var imageEl = image.el;
        if (self.processImageEl) {
          imageEl = self.processImageEl(image.el);
        }
        $(imageEl).addClass('loading');
        var imageObject = new Image();
        imageObject.onload = function () {
          imageLoaded(imageEl);
          imageObject = null;
        };
        imageObject.onerror = function () {
          imageLoaded(imageEl);
          imageObject = null;
        };
        imageObject.src = image.url;
      });

      UIItem.prototype.enhance.call(this);
    }
  });

  return UIImagesLoader;
});