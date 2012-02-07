define(["joshlib!uielement","joshlib!utils/dollar"], function(UIElement,$) {
  
  var UIList = UIElement.extend({

    initialize:function(options) {

      //TODO support for just passing a model
      //If a collection is given we'll only display the first item.
      if (options.collection) {
        this.setCollection(options.collection);
      }

      if (options.templateEl) {
        this.mainTemplate = this.compileTemplate($(options.templateEl).html());
      }

      UIElement.prototype.initialize.call(this, options);
    },

    setCollection: function(collection) {
      var self = this;

      this.collection = collection;


      //Do we need all this ? reset seems to fire too often.
      collection.bind('change',   this.render, this);
      collection.bind('add',   this.render, this);
      collection.bind('remove',   this.render, this);
      collection.bind('reset',   this.render, this);

    },

    generate:function(cb) {

      if (this.collection) {
        var elems = this.collection.toJSON();
        var i=0;
        str = this.mainTemplate({"item":elems[i],"obj":this.collection.at(i)});
        cb(null,str);
      }

    }


  });

  return UIList;

});