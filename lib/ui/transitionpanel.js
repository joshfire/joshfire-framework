/**
 * @fileOverview A transition panel is a card panel that triggers an animation
 * when the view transitions from one child to another.
 *
 * The animation can be just about anything. The transition panel positions
 * the "from" and "to" views accordingly before running the transition.
 */
/* global define */

define([
  'joshlib!ui/cardpanel',
  'joshlib!vendor/underscore'
], function (UICardPanel, _) {

  // See http://stackoverflow.com/questions/5023514/how-do-i-normalize-css3-transition-functions-across-browsers
  var transitionEndEvent = (function () {
    var transition;
    var el = document.createElement('fakeelement');
    var transitions = {
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    };

    for (transition in transitions) {
      if (el.style[transition] !== undefined){
        return transitions[transition];
      }
    }
    return null;
  })();


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

      // The current position of the top-left corner
      this.translate = {
        x: 0,
        y: 0
      };

      // The view handles one transition at a time and queues up
      // further transitions.
      this.transitioning = false;
      this.transitions = [];
      this.listenTo(this, 'transition:end', function () {
        this.transitioning = false;
        this.runNextTransition();
      });

      UICardPanel.prototype.initialize.call(this, options);
    },


    /**
     * Executes next transition if there's one
     *
     * @function
     */
    runNextTransition: function () {
      var fn = this.transitions.pop();
      if (!fn) {
        return;
      }
      fn();
    },


    /**
     * Executes the given transition function if the view is ready to listen
     * to new commands or queue the function for execution if not.
     *
     * @function
     * @param {function} fn The function to run
     */
    runTransition: function (fn) {
      if (this.transitioning) {
        this.transitions.push(fn);
        return;
      }
      else {
        this.transitions.push(fn);
        this.runNextTransition();
      }
    },

    /**
     * Runs the given function when the transition of the given element is over
     *
     * The function does something which seems totally useless but is not: it
     * checks the width of the element after having bound the event listener
     * to the element. That seems needed in Chrome when this note is written
     * (2013-11-25) for the event to trigger.
     *
     * @function
     * @param {Element} el The element to check
     * @param {function} callback The function to run
     */
    onTransitionEnd: function (el, callback) {
      if (transitionEndEvent) {
        this.$(el).one(transitionEndEvent, callback);
        this.$(el).width();
      }
      else {
        setTimeout(_.bind(function () {
          this.trigger('transition:end');
        }, this), 500);
      }
    },


    /**
     * Sets the visibile child.
     *
     * @function
     * @param {String} the name of the child
     * @param {String} direction of the transition (left, right, up, down, none)
     */
    showChild: function(name, transitionDescriptor) {
      this.runTransition(_.bind(function () {
        var descriptors = null;
        if (transitionDescriptor) {
          descriptors = transitionDescriptor.split(':');
          this.transitionParameter = descriptors[1];
          if (this.transitionParameter) {
            this.transitionType = descriptors[0] || 'none';
          }
          else {
            this.transitionType = 'none';
          }
        }
        else {
          this.transitionType = 'none';
          this.transitionParameter = 'none';
        }

        UICardPanel.prototype.showChild.call(this, name);
      }, this));
    },


    /**
     * Runs a slide transition between two child views
     *
     * Triggers a "transition:end" when the transition is over
     *
     * @function
     * @param {View} from The child view to transition from (should be displayed)
     * @param {View} to The child view to transition to
     */
    slideTransition: function (from, to) {
      var $surface = this.$('.joshfire-inner').first();
      var width = this.$el.width();
      var height = this.$el.height();

      // The translate instance property keeps track of the translate
      // values of the viewport.
      var top = this.translate.y * -1;
      var left = this.translate.x * -1;

      // Set the position of the target child based on the requested
      // transition parameter
      var style = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 1
      };

      switch (this.transitionParameter) {
      case 'right':
        _.extend(style, {
          left: (left + width) + 'px',
          top: top + 'px'
        });
        this.translate.x -= width;
        break;

      case 'up':
        _.extend(style, {
          left: left + 'px',
          top: (top + height) + 'px'
        });
        this.translate.y -= height;
        break;

      case 'down':
        _.extend(style, {
          left: left + 'px',
          top: (top - height) + 'px'
        });
        this.translate.y += height;
        break;

      case 'left':
        _.extend(style, {
          left: (left - width) + 'px',
          top: top + 'px'
        });
        this.translate.x += width;
        break;
      }

      // Position target element accordingly
      this.$(to.el).css(style);

      // Compute the translation CSS property
      var translate = 'translate(' +
        this.translate.x + 'px,' +
        this.translate.y + 'px)';

      // Time to show the target child. It won't appear since it
      // is positioned off screen for the time being.
      // (Also take that opportunity to ensure that only origin and
      // target children are displayed)
      _.each(this.children, _.bind(function (child) {
        if ((child === from) || (child === to)) {
          child.show();
        }
        else {
          child.hide();
        }
      }, this));

      this.onTransitionEnd($surface.get(0), _.bind(function () {
        $surface.css({
          '-webkit-transition': 'none',
          '-moz-transition': 'none',
          '-ms-transition': 'none',
          '-o-transition': 'none',
          'transition': 'none',
        });
        this.trigger('transition:end');
      }, this));

      // Transition the viewport to reveal the target element
      $surface.css({
        '-webkit-transition': this.cssTransition,
        '-moz-transition': this.cssTransition,
        '-ms-transition': this.cssTransition,
        '-o-transition': this.cssTransition,
        'transition': this.cssTransition,
        '-webkit-transform': translate,
        '-moz-transform': translate,
        '-ms-transform': translate,
        '-o-transform': translate,
        'transform': translate
      });
    },


    /**
     * Runs a fade in/out transition between two children views
     *
     * The function triggers a "transition:end" event when the transition is
     * over.
     *
     * @function
     * @param {View} from The view to transition from
     * @param {View} to The view to transition to
     */
    fadeTransition: function(from, to) {
      var transition = 'opacity' +
        ' ' + this.cssTransitionDuration +
        ' ' + this.cssTransitionEasing;

      // The translate instance property keeps track of the translate
      // values of the viewport.
      var top = this.translate.y * -1;
      var left = this.translate.x * -1;

      // Hide and position target child on top/left corner
      this.$(to.el).css({
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: left,
        top: top,
        opacity: 0,
        '-webkit-transition': transition,
        '-moz-transition': transition,
        '-ms-transition': transition,
        '-o-transition': transition,
        'transition': transition
      });

      if (from && from.el) {
        this.$(from.el).css({
          position: 'absolute',
          width: '100%',
          height: '100%',
          left: left,
          top: top,
          opacity: 1,
          '-webkit-transition': transition,
          '-moz-transition': transition,
          '-ms-transition': transition,
          '-o-transition': transition,
          'transition': transition
        });
      }

      _.each(this.children, _.bind(function(child) {
        if(child === to || child === from) {
          child.show();
        } else {
          child.hide();
        }
      }, this));

      this.onTransitionEnd(to.el, _.bind(function () {
        this.trigger('transition:end');
      }, this));

      if (from && from.el) {
        if (this.transitionParameter === 'cross') {
          this.$(from.el).css({
            opacity: 0
          });
          this.$(to.el).css({
            opacity: 1
          });
        }
        else if (this.transitionParameter === 'outin') {
          var runSecondStep = _.bind(function () {
            this.$(to.el).css({
              opacity: 1
            });
          }, this);
          if (transitionEndEvent) {
            this.$(from.el).one(transitionEndEvent, runSecondStep);
          }
          else {
            setTimeout(runSecondStep, 500);
          }
          this.$(from.el).css({
            opacity: 0
          });
        }
      } else {
        this.$(to.el).css({
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
      this.transitioning = true;
      if (!(this.transitionType && this.transitionParameter) ||
           (this.transitionType === 'none')) {
        UICardPanel.prototype.transition.call(this, fromChild, toChild);
        this.trigger('transition:end');
        return;
      }

      var from = this.children[fromChild || ''];
      var to = this.children[toChild || ''];

      if (this.transitionType === 'slide') {
        return this.slideTransition(from, to);
      } else if (this.transitionType === 'fade') {
        return this.fadeTransition(from, to);
      }

      UICardPanel.prototype.transition.call(this, fromChild, toChild);
      this.trigger('transition:end');
    },


    enhance: function () {
      UICardPanel.prototype.enhance.call(this);

      // Set the wrapper's heights to 100%
      // The viewport hides the overflowing parts of the surface.
      this.$('.joshfire-outer').first().css({
        position: 'relative',
        height: '100%',
        overflow: 'hidden'
      });

      // The surface is simply a reference point for the translation.
      // Its dimentions are what they are for CSS convenience.
      this.$('.joshfire-inner').first().css({
        position: 'relative',
        height: '100%',
        overflow: 'visible'
      });
    }
  });

  return SlidePanel;
});
