define(['joshlib!ui/item','joshlib!utils/mediaplayerlib','joshlib!utils/dollar','joshlib!vendor/underscore'], function(UIItem,mediaFactory,$,_) {

  var mediaFactory = new mediaFactory
  var UIFactoryMedia = UIItem.extend({

    initialize: function(options) {
      this.mediaOptions = options.mediaOptions || {};

      UIItem.prototype.initialize.call(this, options);
    },

    generate: function(cb) {
      mediaFactory.resolve(this.model.toJSON()).toHtml(this.mediaOptions, cb);
    }
  });

  return UIFactoryMedia;
});
