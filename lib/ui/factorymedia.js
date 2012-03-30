define(['joshlib!ui/item','joshlib!utils/mediaplayerlib','joshlib!utils/dollar','joshlib!vendor/underscore'], function(UIItem,mediaFactory,$,_) {

  var UIFactoryMedia = UIItem.extend({

    initialize: function(options) {
      if (options.template){
        this.template = this.compileTemplate(options.template);
      }

      this.mediaOptions = options.mediaOptions || {};

      UIItem.prototype.initialize.call(this, options);
    },

    generate: function(cb) {
      var builder = mediaFactory.resolve(this.model.toJSON(), this.mediaOptions);

      builder.toHtml(_.bind(function(err, html) {
        if(this.template) {
          var context = {
            model:    this.model,
            obj:      this.model,
            item:     this.model ? this.model.toJSON() : {},
            media:    html
          };

          cb(err, this.template(context));
        } else {
          cb(err, html);
        }
      }, this));
    }
  });

  return UIFactoryMedia;
});
