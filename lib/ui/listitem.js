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

define([
  'joshlib!uielement',
  'joshlib!utils/woodman'
], function (UIElement, woodman) {
  var logger = woodman.getLogger('joshfire.framework.ui.listitem');

  var UIListItem = UIElement.extend({

    tagName: 'li',

    initialize: function(options) {
      options = options || {};

      // Initialize the instance ID for logging purpose as needed
      this.initializeLogId(options);
      logger.log(this.logid, 'initialize');

      this.view = options.view;
      this.view.data = this.view.data || {};
      this.offset  = options.offset;

      // We'll trigger the "load" event when the underlying view is loaded
      this.customLoadEvent = true;
      if (this.view) {
        this.listenTo(this.view, 'load', function () {
          this.trigger('load');
        });
      }

      UIElement.prototype.initialize.call(this, options);
    },

    generate: function(cb) {
      logger.log(this.logid, 'generate');
      var self = this;
      this.view.data.offset = this.offset;
      this.view.generate(function(err, html) {
        html = self.wrapContent(html, self.offset+'');
        cb(null, html);
      });
    },

    enhance: function() {
      logger.log(this.logid, 'enhance');
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
    },

    /**
     * Overrides base "remove" function to propagate the request to its child.
     *
     * Note that the view is not operational anymore after a call to "remove".
     *
     * @function
     */
    remove: function () {
      logger.log(this.logid, 'remove');
      UIElement.prototype.remove.call(this);
      if (this.view) {
        this.view.remove();
        this.view = null;
      }
    }
  });

  return UIListItem;
});