/**
 * @fileoverview Real base View class for the Joshfire Framework.
 *
 * The UIElement class is the base view class that all views in the
 * Framework must extend.
 *
 * In the generic case, the UIElement class is synonymous to View.
 *
 * The framework automatically replaces this empty shell by a
 * device-specific or capability-specific adapter class depending
 * on the context under which the underlying application is run.
 *
 * For instance, the "phone" adapter adds scrolling capabilities
 * as many mobile browsers do not support scrolling content within
 * a fixed sized section of a page.
 */

/*global define*/


define([
	'joshlib!view',
	'joshlib!utils/dollar',
	'joshlib!vendor/underscore'
], function(View, $, _) {
  var UIElement = View.extend({
		initialize: function(options) {
			this.onScroll = this.options.onScroll || null;
			View.prototype.initialize.call(this,options);
		},
		enhance: function() {
			if (this.onScroll) {
				this.$el.on('scroll', _.bind(function(e) {
					var el = $(e.target);
					this.onScroll.call(el[0], e, el[0].scrollHeight, el.scrollTop(), el.scrollLeft());
				}, this));
			}
			View.prototype.enhance.call(this);
		}
  });
  return UIElement;
});