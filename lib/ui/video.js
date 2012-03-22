define(['joshlib!ui/item','joshlib!utils/dollar','joshlib!vendor/underscore'], function(UIItem,$,_) {

  var UIVideo = UIItem.extend({

    initialize: function(options) {
      if (options.template){
        this.template = this.compileTemplate(options.template);
      }
      else if (options.templateEl) {
        this.template = this.compileTemplate($(options.templateEl).html());
      }

      this.getVideoUrl = options.getVideoUrl || function() {
        if(!this.model) return null;
        return this.model.contentUrl;
      };

      UIItem.prototype.initialize.call(this, options);
    },

    generate: function(cb) {
      if(!this.model) { cb(null, ''); return; }

      var context = {
        model:    this.model,
        obj:      this.model,
        item:     this.model ? this.model.toJSON() : {},
        videoUrl: this.getVideoUrl.call(this)
      };

      _.extend(context, this.data);

      cb(null, this.template(context));
    }
  });

  return UIVideo;
});