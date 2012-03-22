
define(["joshlib!uielement","joshlib!utils/dollar","joshlib!vendor/underscore"], function(UIElement,$,_) {

  var UITitlebar = UIElement.extend({

    initialize: function(options) {
      if (options.template){
        this.template = this.compileTemplate(options.template);
      }
      else if (options.templateEl) {
        this.template = this.compileTemplate($(options.templateEl).html());
      }

      this.setTitle(options.title);

      UIElement.prototype.initialize.call(this, options);
    },

    setTitle: function(value, render) {
      this.title = value;

      if(render) this.render();
    },

    generate: function(cb) {
      var context = {
        title:  this.title
      };

      _.extend(context, this.data);

      cb(null, this.template(context));
    }
  });

  return UITitlebar;
});