/*

  A single item, binds to a model.

*/

define(["joshlib!uielement","joshlib!utils/dollar","joshlib!vendor/underscore"], function(UIElement,$,_) {

  var UIItem = UIElement.extend({

    initialize: function(options) {
      if (options.template){
        this.template = this.compileTemplate(options.template);
      }
      else if (options.templateEl) {
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

    generate: function(cb) {
      if(!this.model) {
        cb(null, '');
        return;
      }

      var context = {
        model:  this.model,
        obj: this.model,
        item: this.model ? this.model.toJSON() : {}
      };

      _.extend(context, this.data);

      cb(null, this.template(context));
    }
  });

  return UIItem;
});