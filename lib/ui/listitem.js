/**
 * A list item.
 *
 * The ListItem class is mostly intended for internal use within a List.
 *
 * The ListItem class wraps a view that provides the content of the item.
 *
 * As implemented, the ListItem class is useless. It should provide
 * the wrapper markup that converts a view into a proper list item. Typically,
 * for an <ol> or <ul> list, the ListItem class should provide the <li> tag
 * and delegates the inner HTML of the item to the wrapped view.
 *
 * Right now, the wrapped view must include the <li> tag in its template
 * which makes it impossible to reuse the wrapped view in other contexts
 * (and makes this ListItem view totally useless for the time being as
 * already stated)
 */

define(["joshlib!uielement","joshlib!vendor/underscore"], function(UIElement,_) {

  var UIListItem = UIElement.extend({

    initialize: function(options) {
      this.view = options.view;
      this.offset  = options.offset;

      // We'll trigger the "load" event when the underlying view is loaded
      this.customLoadEvent = true;
      if (this.view) {
        this.view.bind('load', _.bind(function () {
          this.trigger('load');
        }, this));
      }

      UIElement.prototype.initialize.call(this, options);
    },

    setItemElement: function(el) {
      this.view.setElement(el);
    },

    generate: function(cb) {
      this.view.data.offset = this.offset;
      this.view.generate(cb);
    },

    render: function() {
      this.view.render();
    },

    setContent: function(html) {
      this.view.setContent(html);
    },

    hide: function() {
      this.view.hide();
    },

    show: function() {
      this.view.show();
    },

    enhance:function() {
      this.view.enhance();
    }

  });

  return UIListItem;
});