/*

 Image loader.

 Pass a getImageUrl function as an option, and the class 'loading' will be added to the
 DOM element while the image is loading.

 When rendering the template imageUrl is passed as a parameter.

*/

define(['joshlib!ui/item','joshlib!utils/dollar','joshlib!vendor/underscore'], function(UIItem,$,_) {

  var UIImageLoader = UIItem.extend({

    initialize: function(options) {
      if (options.templateEl) {
        this.template = this.compileTemplate($(options.templateEl).html());
      }

      this.getImageUrl = options.getImageUrl || function() {
        if(!this.model) return null;
        return this.model.imageUrl;
      };

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
        var $el = $(this.el);

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