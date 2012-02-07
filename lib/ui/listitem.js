/*

  A list item.

  It should not be used directly -- it is used internally by UIList.

  Concatenates a view (via options.view) to make it compatible with
  a list.

*/

define(["joshlib!uielement","joshlib!vendor/underscore"], function(UIElement,_) {

  var UIListItem = UIElement.extend({

    initialize: function(options) {
      this.view = options.view;
      this.offset  = options.offset;

      UIElement.prototype.initialize.call(this, options);
    },

    setElement: function(el) {
      this.view.el = el;
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