/**
 * @fileOverview Implementation of a base UI element view for Samsung TVs.
 *
 * In practice, the only difference is the support for 3D transforms.
 */
define([
  'joshlib!adapters/tv/uielement'
], function (UIElement) {
  var view = UIElement.extend({
    initialize: function (options) {
      options = options || {};
      options.translate3d = false;
      UIElement.prototype.initialize.call(this, options);
    }
  });
  return view;
});