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
      if(this.model) {
        var self = this;
        var $el = $(this.el).addClass('loading');

        if (this.image) {
          this.image.onload = null;
        }
        this.image = new Image();
        this.image.onload = function() {
          $el.removeClass('loading');
          self.image = null;
        };

        this.image.src = this.getImageUrl.call(this);
      }

      UIItem.prototype.enhance.call(this);
    }
  });

  return UIImageLoader;
});