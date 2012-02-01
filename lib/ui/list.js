/*

  A list.

  Binds to a collection. Every item has its own view, which is created by the
  itemFactory options.

  Will also add a loading class to the DOM element when the collection is syncing.

*/

define(["joshlib!uielement","joshlib!ui/listitem","joshlib!ui/item","joshlib!utils/dollar","joshlib!vendor/underscore"], function(UIElement, UIListItem, UIItem, $, _) {

  var UIList = UIElement.extend({

    initialize:function(options) {
      if (options.templateEl) {
        this.template = this.compileTemplate($(options.templateEl).html());
      } else {
        this.template = this.compileTemplate('<ul><%= children %></ul>');
      }

      this.UIItemClass = options.UIItemClass || UIListItem;
      this.itemOptions = options.itemOptions || {scroller: false};
      this.itemTemplateEl = options.itemTemplateEl;
      this.itemOptions.templateEl = this.itemOptions.templateEl || this.itemTemplateEl;
      this.contentSelector = options.contentSelector;
      this.items = [];

      // Default item factory
      this.itemFactory = options.itemFactory || function(model, offset) {
        var params = {
          model: model,
          offset: offset
        }

        _.extend(params, this.itemOptions);

        return new UIItem(params);
      }

      UIElement.prototype.initialize.call(this);

      if (options.collection) this.setCollection(options.collection);
    },

    setCollection: function(collection, render) {
      if(this.collection) {
        collection.unbind('change', this.update, this);
        collection.unbind('add', this.update, this);
        collection.unbind('remove', this.update, this);
        collection.unbind('reset', this.update, this);
        collection.unbind('syncstarted', this.syncStartedHandler, this);
        collection.unbind('syncsuccess', this.syncSuccessHandler, this);
        collection.unbind('syncerror', this.syncErrorHandler, this);
      }

      this.collection = collection;

      if(collection) {
        collection.bind('change', this.update, this);
        collection.bind('add', this.update, this);
        collection.bind('remove', this.update, this);
        collection.bind('reset', this.update, this);
        collection.bind('syncstarted', this.syncStartedHandler, this);
        collection.bind('syncsuccess', this.syncSuccessHandler, this);
        collection.bind('syncerror', this.syncErrorHandler, this);
      }

      this.update(render);
    },

    update: function(render) {
      // TODO: destroy previous items?

      this.items = new Array(this.collection.length);

      // Create item elements
      for (var i = 0; i < this.collection.length; i++) {
        var model = this.collection.at(i);
        this.items[i] = new UIListItem({
          view: this.itemFactory.call(this, model, i),
          model:  model,
          offset: i
        });
      }

      if(render) this.render();
    },

    generate: function(cb, context) {
      var items = this.items;
      var contents = new Array(items.length);
      var processed = 0;
      var template = this.template;

      for (var i = 0; i < items.length; i++) {
        // Create a scope for the current item
        (function(item, num) {
          this.generateItem(function(err, content) {
            contents[num] = content;

            // If last item was processed, fire callback
            if(++processed === items.length) {
              var str = template({children: contents.join('')});
              cb(null, str);
            }
          }, context, item, num);
        }).call(this, items[i], i);
      }
    },

    generateItem: function(cb, context, item, offset) {
      item.generate(cb, context);
    },

    enhance: function() {
      var $lis = this.$('li');

      for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        item.setElement($lis[i]);
        item.enhance();
      }

      UIElement.prototype.enhance.call(this);
    },

    setContent: function(html) {
      if(this.contentSelector) {
        this.$(this.contentSelector).html(html);
      } else {
        $(this.el).html(html);
      }
    },

    syncStartedHandler: function() {
      $(this.el).addClass('loading');
    },

    syncSuccessHandler: function() {
      $(this.el).removeClass('loading');
    },

    syncErrorHandler: function() {
      $(this.el).removeClass('loading');
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