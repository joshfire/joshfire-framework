define(["joshlib!uielement","joshlib!vendor/jquery"], function(UIElement,$) {
  
  var UIList = UIElement.extend({

    initialize:function(options) {
      if (options.collection) {
        this.setCollection(options.collection);
      }
      
      if (options.itemTemplateEl) {
        this.itemTemplate = this.compileTemplate($(options.itemTemplateEl).html());
      }
    },

    setCollection: function(collection) {
      var self = this;
/*
      if (this.loadingText) {
        $(this.el).html(this.loadingText);
      }
*/
      this.collection = collection;


      //Do we need all this ? reset seems to fire too often.
      collection.bind('change',   this.render, this);
      collection.bind('add',   this.render, this);
      collection.bind('remove',   this.render, this);
      collection.bind('reset',   this.render, this);

      
    },

    render:function(eventName) {

      var elems = this.collection.toJSON();

      var str = "";
      for (var i=0;i<elems.length;i++) {
        str+=this.itemTemplate({"item":elems[i],"model":this.collection.at(i)});
      }
      $(this.el).html(str);
		/*
      if (this.emptyEl) {
        if (!elems.length) {
          $(this.emptyEl).show();
        } else {
          $(this.emptyEl).hide();
        }
      }
      if (this.notEmptyEl) {
        if (!elems.length) {
          $(this.notEmptyEl).hide();
        } else {
          $(this.notEmptyEl).show();
        }
      }
      */
    }

  });

  return UIList;

});