/*

  A single item, binds to a model.

*/

define(["joshlib!uielement","joshlib!vendor/jquery","joshlib!vendor/underscore"], function(UIElement,$,_) {

  var UIItem = UIElement.extend({

    initialize: function(options) {
      if (options.templateEl) {
        this.template = this.compileTemplate($(options.templateEl).html());
      }

      this.setModel(options.model);

      UIElement.prototype.initialize.call(this, options);
    },

    setModel: function(model, render) {
      this.model = model;

      if(model) {
        model.bind('change', this.render, this);
      }

      if(render) this.render();
    },

    generate: function(cb, context) {
      var params = {
        model:  this.model,
        obj:    this.model,
        item:   this.model ? this.model.toJSON() : {}
      }

      if(context) _.extend(params, context);

      cb(null, this.template(params));
    }
  });

  return UIItem;
});