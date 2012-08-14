/*
 * @fileoverview A "fade-in" panel is a multi-panel view that uses a fade-in
 * transition effect to move from one panel to another.
 *
 * The view derivates from CardPanel
 */

define([
  'joshlib!ui/cardpanel',
  'joshlib!vendor/underscore',
  'joshlib!utils/dollar'
], function (UICardPanel, _, $) {

  var FadeInPanel = UICardPanel.extend({

    /**
     * Element initialization.
     *
     * Called once when the element is created.
     *
     * @function
     * @param {Object} options Element options.
     */
    initialize: function(options) {
      this.cssTransition = options.cssTransition || '.4s ease-in-out all';

      UICardPanel.prototype.initialize.call(this, options);
    },

    /**
     * Hides the current child and shows another one using a slide transition.
     *
     * @function
     * @param {String} the name of old visible child
     * @param {String} the name of new visible child
     */
    transition: function(fromChild, toChild) {
      // Hide and position target child on top/left corner
      var to = this.children[toChild];
      to.hide();
      $(to.el).css({
        'filter': 'alpha(opacity=0)',
        '-khtml-opacity': 0,
        '-moz-opacity': 0,
        '-ms-opacity': 0,
        '-o-opacity': 0,
        'opacity': 0,
        '-webkit-transition': 'none',
        '-moz-transition': 'none',
        '-ms-transition': 'none',
        '-o-transition': 'none',
        'transition': 'none'
      });

      // Show the target child, hide all other children
      // and start the transition towards a fully opaque view
      _.each(this.children, _.bind(function(child, name) {
        child.hide();
      }, this));
      to.show();

      $(to.el).css({
        'filter': 'alpha(opacity=100)',
        '-khtml-opacity': 1,
        '-moz-opacity': 1,
        '-ms-opacity': 1,
        '-o-opacity': 1,
        'opacity': 1,
        '-webkit-transition': '0.7s ease-in-out all',
        '-moz-transition': '0.7s ease-in-out all',
        '-ms-transition': '0.7s ease-in-out all',
        '-o-transition': '0.7s ease-in-out all',
        'transition': '0.7s ease-in-out all',
        '-webkit-backface-visibility': 'hidden'
      });
    }
  });

  return FadeInPanel;
});
