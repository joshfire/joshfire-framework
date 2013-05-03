/*

  A slide panel.

  A card panel with a slide transition.

*/

define([
  'joshlib!ui/cardpanel',
  'joshlib!vendor/underscore',
  'joshlib!utils/dollar'
], function(
  UICardPanel,
  _,
  $
) {

  var SlidePanel = UICardPanel.extend({

    /**
     * Element initialization.
     *
     * Called once when the element is created.
     *
     * @function
     * @param {Object} options Element options.
     */
    initialize: function(options) {
      this.cssTransitionDuration = options.cssTransitionDuration || '.4s';
      this.cssTransitionEasing = options.cssTransitionEasing || 'ease-in-out';

      this.cssTransition = options.cssTransition || this.cssTransitionDuration + ' ' + this.cssTransitionEasing + ' all';

      UICardPanel.prototype.initialize.call(this, options);
    },

    /**
     * Sets the visibile child.
     *
     * @function
     * @param {String} the name of the child
     * @param {String} direction of the transition (left, right, up, down, none)
     */
    showChild: function(name, transitionDescriptor) {

      if(transitionDescriptor) {
        var descriptors = transitionDescriptor.split(':');
        this.transitionParameter = descriptors[1];
        if(this.transitionParameter) {
          this.transitionType = descriptors[0] || 'none';
        } else {
          this.transitionType = 'none';
        }
      } else {
        this.transitionType = 'none';
        this.transitionParameter = 'none';
      }

      UICardPanel.prototype.showChild.call(this, name);
    },


    slideTransition: function(from, to) {

      // Hide and position target child on top/left corner
      to.hide();
      $(to.el).css({
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        opacity: 1,
        '-webkit-transition': 'none',
        '-moz-transition': 'none',
        '-ms-transition': 'none',
        '-o-transition': 'none',
        'transition': 'none'
      });


      var translateX = 0;
      var translateY = 0;
      var width = this.$el.width();
      var height = this.$el.height();
      var base = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        '-webkit-transition': 'none',
        '-moz-transition': 'none',
        '-ms-transition': 'none',
        '-o-transition': 'none',
        'transition': 'none'
      };
      var complementary = {};

      if(this.transitionParameter === 'left') {
        complementary = {
          left: '100%',
          top: 0
        };
        translateX = '-' + width + 'px';
        translateY = 0;
      } else if (this.transitionParameter === 'right') {
        complementary = {
          left: '-100%',
          top: 0
        };
        translateX = width + 'px';
        translateY = 0;
      } else if (this.transitionParameter === 'up') {
        complementary = {
          left: 0,
          top: '100%'
        };
        translateX = 0;
        translateY = '-' + height + 'px';
      } else if (this.transitionParameter === 'down') {
        complementary = {
          left: 0,
          top: '100%'
        };
        translateX = 0;
        translateY = height + 'px';
      }

      base = _.extend(base, complementary);

      if(from) {
        $(from.el).css(base);
      }

      var translate = 'translate(' + translateX + ',' + translateY + ')';
      this.$('.joshfire-wrapper').first().css({
        '-webkit-transition': 'none',
        '-moz-transition': 'none',
        '-ms-transition': 'none',
        '-o-transition': 'none',
        'transition': 'none',
        '-webkit-transform': translate,
        '-moz-transform': translate,
        '-ms-transform': translate,
        '-o-transform': translate,
        'transform': translate
      });

      // Time to show the target child. It won't appear since it
      // is positioned off screen for the time being.
      // (Also take that opportunity to ensure that only origin and
      // target children are displayed)
      _.each(this.children, _.bind(function(child) {
        if(child === to || child === from) {
          child.show();
        } else {
          child.hide();
        }
      }, this));
      setTimeout(_.bind(function() {
        // Transition the viewport to the top/left corner,
        // causing the animation to run.
        this.$('.joshfire-wrapper').first().css({
          '-webkit-transition': this.cssTransition,
          '-moz-transition': this.cssTransition,
          '-ms-transition': this.cssTransition,
          '-o-transition': this.cssTransition,
          'transition': this.cssTransition,
          '-webkit-transform': 'translate(0,0)',
          '-moz-transform': 'translate(0,0)',
          '-ms-transform': 'translate(0,0)',
          '-o-transform': 'translate(0,0)',
          'transform': 'translate(0,0)'
        });
      }, this));
    },

    fadeTransition: function(from, to) {

      var transition = 'opacity ' + this.cssTransitionDuration + ' ' + this.cssTransitionEasing;

      // Hide and position target child on top/left corner
      $(to.el).css({
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        opacity: 0,
        '-webkit-transition': transition,
        '-moz-transition': transition,
        '-ms-transition': transition,
        '-o-transition': transition,
        'transition': transition
      });

      if(from && from.el) {
        $(from.el).css({
          position: 'absolute',
          width: '100%',
          height: '100%',
          left: 0,
          top: 0,
          opacity: 1,
          '-webkit-transition': transition,
          '-moz-transition': transition,
          '-ms-transition': transition,
          '-o-transition': transition,
          'transition': transition
        });
      }

      this.$('.joshfire-wrapper').first().css({
        '-webkit-transition': 'none',
        '-moz-transition': 'none',
        '-ms-transition': 'none',
        '-o-transition': 'none',
        'transition': 'none',
        '-webkit-transform': 'translate(0,0)',
        '-moz-transform': 'translate(0,0)',
        '-ms-transform': 'translate(0,0)',
        '-o-transform': 'translate(0,0)',
        'transform': 'translate(0,0)'
      });

      _.each(this.children, _.bind(function(child) {
        if(child === to || child === from) {
          child.show();
        } else {
          child.hide();
        }
      }, this));

      if(from && from.el) {
        if (this.transitionParameter === 'cross') {

          $(from.el).css({
            opacity: 0
          });
          $(to.el).css({
            opacity: 1
          });

        } else if (this.transitionParameter === 'outin') {
          var transitionEvents = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';
          var onTransitionEnd = function() {
            $(from.el).off(transitionEvents, onTransitionEnd);
            $(to.el).css({
              opacity: 1
            });
          };
          $(from.el).on(transitionEvents , onTransitionEnd);
          $(from.el).css({
            opacity: 0
          });
        }
      } else {
        $(to.el).css({
          opacity: 1
        });
      }
    },

    /**
     * Hides the current child and shows another one using a slide transition.
     *
     * @function
     * @param {String} the name of old visible child
     * @param {String} the name of new visible child
     */
    transition: function(fromChild, toChild) {
      var from, to;
      if(!(this.transitionType && this.transitionParameter) ||
           this.transitionType === 'none') {

        UICardPanel.prototype.transition.call(this, fromChild, toChild);
        return;
      }

      from = this.children[fromChild || ''];
      to = this.children[toChild || ''];

      if(this.transitionType === 'slide') {
        return this.slideTransition(from, to);
      } else if (this.transitionType === 'fade') {
        return this.fadeTransition(from, to);
      }

      return UICardPanel.prototype.transition.call(this, fromChild, toChild);
    },

    enhance: function () {
      UICardPanel.prototype.enhance.call(this);

      // Set the wrapper as root for absolute positioning
      // of children views.
      this.$('.joshfire-wrapper').first().css({
        position: 'relative'
      });
    }
  });

  return SlidePanel;
});
