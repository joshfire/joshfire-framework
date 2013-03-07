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

define(['joshlib!uielement', 'joshlib!vendor/underscore'], function(UIElement, _) {

  var UIListItem = UIElement.extend({

    tagName: 'li',

    initialize: function(options) {
      this.view = options.view;
      this.view.data = this.view.data || {};
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

    generate: function(cb) {
      var self = this;
      this.view.data.offset = this.offset;
      this.view.generate(function(err, html) {
        html = self.wrapContent(html, self.offset+'');
        cb(null, html);
      });
    },

    enhance: function() {
      if (this.view) {
        this.view.enhance();
      }
      UIElement.prototype.enhance.call(this);
    },

    setElement: function(el, delegate) {
      if (this.view) {
        this.view.setElement(el, delegate);
      }
      UIElement.prototype.setElement.call(this, el, delegate);
    }
  });

  return UIListItem;
});