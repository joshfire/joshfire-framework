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
    },

    setElement: function(el) {
      this.view.el = el;
    },

    generate: function(cb, context) {
      var params = {
        offset: this.offset
      };

      if(context) _.extend(params, context);

      this.view.generate(cb, params);
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