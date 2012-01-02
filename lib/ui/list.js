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

    generate:function(cb) {

      var elems = this.collection.toJSON();

      var str = "";
      for (var i=0;i<elems.length;i++) {
        str+=this.itemTemplate({"item":elems[i],"obj":this.collection.at(i)});
      }
      cb(null,str);
    },

    //TODO what when multiple uls below?
    setContent:function(html) {
      this.$("ul").html(html);
    }


  });

  return UIList;

});


/*
var UpdatingCollectionView = Backbone.View.extend({
  initialize : function(options) {
    _(this).bindAll('add', 'remove');
 
    if (!options.childViewConstructor) throw "no child view constructor provided";
    if (!options.childViewTagName) throw "no child view tag name provided";
 
    this._childViewConstructor = options.childViewConstructor;
    this._childViewTagName = options.childViewTagName;
 
    this._childViews = [];
 
    this.collection.each(this.add);
 
    this.collection.bind('add', this.add);
    this.collection.bind('remove', this.remove);
  },
 
  add : function(model) {
    var childView = new this._childViewConstructor({
      tagName : this._childViewTagName,
      model : model
    });
 
    this._childViews.push(childView);
 
    if (this._rendered) {
      $(this.el).append(childView.render().el);
    }
  },
 
  remove : function(model) {
    var viewToRemove = _(this._childViews).select(function(cv) { return cv.model === model; })[0];
    this._childViews = _(this._childViews).without(viewToRemove);
 
    if (this._rendered) $(viewToRemove.el).remove();
  },
 
  render : function() {
    var that = this;
    this._rendered = true;
 
    $(this.el).empty();
 
    _(this._childViews).each(function(childView) {
      $(that.el).append(childView.render().el);
    });
 
    return this;
  }
});
*/