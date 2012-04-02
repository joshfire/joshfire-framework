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
      var rePercentage = /^([0-9]{1,3})%$/;
      var match = null;
      var options = _.clone(this.mediaOptions);

      if(!this.model) return cb(null, '');

      if (options.width && _.isString(options.width)) {
        match = options.width.match(rePercentage);
        if (match) {
          options.width = Math.floor($(this.el).width() * parseInt(match[1], 10) / 100);
        }
      }
      if (options.height && _.isString(options.height)) {
        match = options.height.match(rePercentage);
        if (match) {
          options.height = Math.floor($(this.el).height() * parseInt(match[1], 10) / 100);
        }
      }
      var builder = mediaFactory.resolve(this.model.toJSON(), options);

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
