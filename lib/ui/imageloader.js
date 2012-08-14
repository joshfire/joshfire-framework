/**
 * @fileoverview Simple image loader view.
 *
 * Use this view to render a spinner while an image is loaded in the
 * background. The view simply adds a "loading" class name to the view's
 * element, delegating possible transitions and spinners to CSS.
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
 * Pass a "getImageUrl" function as an option so that the view may
 * compute the URL to be loaded in the background.
 *
 * Pass an "imageContainer" property to pass the optional selector to the
 * element that is to receive the "loading" class.
 *
 * The image URL is passed to the view's template as an "imageUrl" parameter.
 */

define(['joshlib!ui/item','joshlib!utils/dollar','joshlib!vendor/underscore'], function(UIItem,$,_) {

  var UIImageLoader = UIItem.extend({

    initialize: function(options) {
      // Set the getImageUrl function if given as parameter,
      // look for an imageUrl on the underlying view's model otherwise
      this.getImageUrl = options.getImageUrl || function() {
        if(!this.model) return null;
        return this.model.imageUrl;
      };

      // Set the image container if defined
      this.imageContainer = options.imageContainer;

      // Call the base class constructor
      UIItem.prototype.initialize.call(this, options);
    },

    generate: function(cb) {
      if(!this.model) { cb(null, ''); return; }

      var context = {
        model:    this.model,
        obj:      this.model,
        item:     this.model ? this.model.toJSON() : {},
        imageUrl: this.getImageUrl.call(this)
      };
      _.extend(context, this.data);

      cb(null, this.template(context));
    },

    enhance: function() {
      if (this.getImageUrl) {
        var self = this;
        var imageUrl = this.getImageUrl();
        var $el = null;
        if (this.imageContainer) {
          $el = this.$(this.imageContainer);
        }
        if (!$el) {
          $el = $(this.el);
        }

        if (this.image) {
          this.image.onload = null;
          this.image = null;
        }
        
        if (imageUrl) {
          $el.addClass('loading');
          this.image = new Image();
          this.image.onload = function() {
            $el.removeClass('loading');
            self.image = null;
          };
          this.image.src = imageUrl;
        }
        else {
          $el.removeClass('loading');
        }
      }

      UIItem.prototype.enhance.call(this);
    }
  });

  return UIImageLoader;
});