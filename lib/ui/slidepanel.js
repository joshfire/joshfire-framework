/**
 * @fileOverview A slide panel is a panel that slides from one child to another
 * using a slide transition.
 *
 * A slide panel reacts to "touch" events, allowing one to slide from one
 * child to another on touch screens. When a touch transition occurs, the
 * view calls the "getTargetChild" function which should typically be
 * overwritten in class instances or derivated classes. That function returns
 * the name of the child view to transition to. The default implementation
 * handles horizontal scrolling and follows the orders of the keys in the
 * children object (which, as anyone knows, is actually not defined in
 * JavaScript, even though all runtimes seem to follow the same order).
 *
 * As opposed to the TransitionPanel view that this view extends, the SlidePanel
 * view triggers transitions on its own whenever the user starts to swipe things
 * around.
 *
 * As the TransitionPanel, the SlidePanel view triggers a "transitionEnd" event
 * when the transition is over that allows callers to react accordingly, e.g.
 * by updating the current route to match the new "state" of the application.
 * The view also triggers a "swipeEnd" event similar to the "transitionEnd"
 * event but specific to this class, so as not to have to parse the properties
 * of the "transitionEnd" transition description to detect swipes.
 */

/* global define */

define([
  'joshlib!utils/woodman',
  'joshlib!ui/transitionpanel',
  'joshlib!vendor/underscore'
], function (woodman, TransitionPanel, _) {
  var logger = woodman.getLogger('joshfire.framework.ui.slidepanel');

  // The animation will use "requestAnimationFrame" which may not yet be
  // supported in some environments. The following code is a polyfill.
  var requestAnimationFrame = window.requestAnimationFrame;
  var cancelAnimationFrame = window.cancelAnimationFrame;
  (function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !requestAnimationFrame; ++x) {
      requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
      cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
          window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!requestAnimationFrame) {
      requestAnimationFrame = function (callback) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function () {
          callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }

    if (!cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }
  }());


  /**
   * The SlidePanel view extends the TransitionPanel to restrict transitions
   * to slide transitions and to add support for touch interactions.
   */
  var SlidePanel = TransitionPanel.extend({
    /**
     * Horizontal/Vertical distance between start point and finger position
     * to start considering that the user is indeed willing to swipe the view
     */
    swipeThreshold: 5,

    /**
     * Horizontal/Vertical percentage of target view that should be displayed
     * for the view to switch to that view when swipe ends. The view rolls back
     * to the initial view otherwise.
     */
    swipeChangeThreshold: 30,


    /**
     * Element initialization.
     *
     * Called once when the element is created.
     *
     * @function
     * @param {Object} options Element options.
     */
    initialize: function (options) {
      options = options || {};
      this.cssTransition = options.cssTransition || '.4s linear all';
      this.hideAfterTransition = options.hideAfterTransition || false;
      this.transitioning = false;
      this.transitions = [];
      this.listenTo(this, 'transitionEnd', function () {
        this.transitioning = false;
        this.runNextTransition();
      });

      if (typeof options.swipeThreshold !== 'undefined') {
        this.swipeThreshold = options.swipeThreshold;
      }
      if (typeof options.swipeChangeThreshold !== 'undefined') {
        this.swipeChangeThreshold = options.swipeChangeThreshold;
      }
      if (_.isFunction(options.getTargetChild)) {
        this.getTargetChild = options.getTargetChild;
      }

      TransitionPanel.prototype.initialize.call(this, options);
    },


    /**
     * Default implementation that selects the "next" child view to render
     * when the user initiates a slide transition with his finger.
     *
     * This default implementation function only handles "left" and "right"
     * transitions and uses the order of the children views in the children
     * object (that order is undefined in theory since there is no such thing
     * as an order of keys in an object in JavaScript, but is the "expected"
     * order in most runtimes in practice).
     *
     * @function
     * @param {String} fromChild The name of the child view currently displayed
     * @param {String} direction The slide direction, one of "up", "down",
     *   "left" or "right".
     * @return {String} The name of the child view to render, null or an empty
     *   string if there is no view to render.
     */
    getTargetChild: function (fromChild, direction) {
      var children = _.keys(this.children);
      var returnNext = false;
      var start = (direction === 'right') ? 0 : (children.length - 1);
      var end = (direction === 'right') ? children.length : -1;
      var incr = (direction === 'right') ? 1 : -1;
      var i = start;
      var child = null;

      if ((direction === 'up') || (direction === 'down')) {
        logger.log('get target child',
          'fromChild=' + fromChild, 'direction=' + direction,
          'vertical slides not enabled');
        return null;
      }

      while (i !== end) {
        child = children[i];
        if (returnNext) {
          logger.log('get target child',
            'fromChild=' + fromChild, 'direction=' + direction,
            'found=' + child);
          return child;
        }
        if (child === fromChild) {
          returnNext = true;
        }
        i += incr;
      }
      logger.log('get target child',
        'fromChild=' + fromChild, 'direction=' + direction,
        'not found');
      return null;
    },


    /**
     * Sets the visibile child.
     *
     * @function
     * @param {String} the name of the child
     * @param {String} direction of the transition (left, right, up, down, none)
     */
    showChild: function (name, transitionDirection) {
      this.runTransition(_.bind(function () {
        var transition = 'none';
        if (transitionDirection && (transitionDirection !== 'none')) {
          transition = 'slide:' + transitionDirection;
        }
        TransitionPanel.prototype.showChild.call(this, name, transition);
      }, this));
    },


    /**
     * Registers the appropriate event handlers to detect touch interactions
     *
     * @function
     */
    enhance: function () {
      TransitionPanel.prototype.enhance.call(this);

      var $surface = this.$('.joshfire-inner').first();

      $surface.css({
        '-webkit-transition': this.cssTransition,
        '-moz-transition': this.cssTransition,
        '-ms-transition': this.cssTransition,
        '-o-transition': this.cssTransition,
        'transition': this.cssTransition
      });

      $surface.on('touchstart', _.bind(this.onTouchStart, this));
      $surface.on('touchmove', _.bind(this.onTouchMove, this));
      $surface.on('touchend', _.bind(this.onTouchEnd, this));
    },


    /**
     * Reacts to "touchstart" events and starts a new "swipe".
     *
     * Note the "swipe" gesture is really triggered when the user already moved
     * about 5 pixels in a given direction. This is done by the "onTouchMove"
     * function
     *
     * @function
     * @private
     * @param {Event} event The event object
     */
    onTouchStart: function (event) {
      // Prevent swipes during transitions
      if (this.transitioning) {
        return;
      }

      this.swipe = {
        start: {
          x: event.originalEvent.touches[0].pageX,
          y: event.originalEvent.touches[0].pageY
        },
        distance: {
          x: 0,
          y: 0
        },
        translateTo: {
          x: 0,
          y: 0
        },
        direction: null
      };
      logger.log('touch start',
        'x=' + this.swipe.start.x,
        'y=' + this.swipe.start.y);
    },


    /**
     * Reacts to "touchmove" events and updates the view accordingly.
     *
     * The function will be called multiple times after an initial call to
     * "onTouchStart". It will not do anything as long as the current finger
     * position is not 5 pixels away from the start position. It sets the
     * swipe's direction when that threshold is met and calls the
     * "getTargetChild" function to determine the name of the child view
     * the user is swiping to. It updates the positions of the current view and
     * destination view accordingly afterwards to follow the user's finger.
     *
     * @function
     * @private
     * @param {Event} event The event object
     */
    onTouchMove: function (event) {
      // Nothing to do if swipe has already been canceled or
      // if a transition is running
      if (!this.swipe || this.transitioning) {
        return;
      }

      var $surface = this.$('.joshfire-inner').first();
      this.swipe.distance = {
        x: event.originalEvent.touches[0].pageX - this.swipe.start.x,
        y: event.originalEvent.touches[0].pageY - this.swipe.start.y
      };

      if (this.swipe.toChild) {
        // Ignore orthogonal moves
        if ((this.swipe.direction === 'left') ||
            (this.swipe.direction === 'right')) {
          this.swipe.distance.y = 0;
        }
        else {
          this.swipe.distance.x = 0;
        }

        // Swipe did start, let's move the viewport accordingly
        // Note the move gets performed without further CSS transitions.
        // That's on purpose not to introduce any additional delay.
        logger.log('touch move', 'to=' + this.swipe.toChild,
          'distance=' + this.swipe.distance.x + ',' + this.swipe.distance.y);
        requestAnimationFrame(_.bind(function () {
          if (!this.swipe || this.transitioning ||
              (this.swipe.direction && !this.swipe.toChild)) {
            return;
          }
          var translate = {
            x: this.translate.x + this.swipe.distance.x,
            y: this.translate.y + this.swipe.distance.y
          };
          var transform = 'translate(' +
            translate.x + 'px,' +
            translate.y + 'px)';
          $surface.css({
            '-webkit-transform': transform,
            '-moz-transform': transform,
            '-ms-transform': transform,
            '-o-transform': transform,
            'transform': transform
          });
        }, this));
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
      else if ((Math.abs(this.swipe.distance.x) > this.swipeThreshold) ||
          (Math.abs(this.swipe.distance.y) > this.swipeThreshold)) {
        // Swipe has not really started yet but user has just moved sufficiently
        // away from its start position.
        if (Math.abs(this.swipe.distance.x) >= Math.abs(this.swipe.distance.y)) {
          if (this.swipe.distance.x > 0) {
            this.swipe.direction = 'left';
          }
          else {
            this.swipe.direction = 'right';
          }
        }
        else {
          if (this.swipe.distance.y > 0) {
            this.swipe.direction = 'up';
          }
          else {
            this.swipe.direction = 'down';
          }
        }
        this.swipe.toChild = this.getTargetChild(
          this.currentChild, this.swipe.direction);
        if (this.swipe.toChild) {
          logger.log('touch move', 'start swipe to', this.swipe.toChild);
          $surface.css({
            '-webkit-transition': 'none',
            '-moz-transition': 'none',
            '-ms-transition': 'none',
            '-o-transition': 'none',
            'transition': 'none',
          });
          this.swipe.translateTo = this.positionSlides(
            this.currentChild, this.swipe.toChild, this.swipe.direction);
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
        else {
          // Not a real swipe since we could not find a destination view
          // in that direction
          logger.log('touch move', 'cancel swipe', this.swipe.toChild);
          this.swipe = null;
        }
      }
      else {
        logger.log('touch move', 'user has not moved enough yet');
      }
    },


    /**
     * Reacts to "touchend" events and triggers the final slide transition.
     *
     * The function either rolls back the view to the current child view or
     * moves on to the destination view depending on whether the swipe went
     * more than some given percentage (~30%) between the views or not.
     */
    onTouchEnd: function () {
      if (!this.swipe || this.transitioning || !this.swipe.toChild) {
        return;
      }
      logger.log('touch end');

      var $surface = this.$('.joshfire-inner').first();
      var percent = {
        x: Math.abs(this.swipe.distance.x / this.$el.width() * 100),
        y: Math.abs(this.swipe.distance.y / this.$el.height() * 100)
      };
      var transitionDescription = {
        from: this.currentChild,
        to: this.swipe.toChild,
        transition: {
          type: 'swipe',
          parameter: this.swipe.direction
        }
      };

      this.transitioning = true;
      requestAnimationFrame(_.bind(function () {
        // Slide to the destination child if the user swiped enough of the
        // destination child into view, stays on the original child otherwise.
        if ((percent.x > this.swipeChangeThreshold) ||
            (percent.y > this.swipeChangeThreshold)) {
          logger.log('touch end', 'sliding to', this.swipe.toChild);
          this.translate = this.swipe.translateTo;
          this.currentChild = this.swipe.toChild;
        }
        transitionDescription.to = this.currentChild;

        // Compute the translation CSS property
        var transform = 'translate(' +
          this.translate.x + 'px,' +
          this.translate.y + 'px)';
        logger.log('touch end', 'translate viewport to',
          'x=' + this.translate.x,
          'y=' + this.translate.y);

        this.onTransitionEnd($surface.get(0), _.bind(function () {
          logger.log('touch end', 'transition over');
          $surface.css({
            '-webkit-transition': 'none',
            '-moz-transition': 'none',
            '-ms-transition': 'none',
            '-o-transition': 'none',
            'transition': 'none',
          });
          this.transitioning = false;
          this.trigger('transitionEnd', transitionDescription);
          this.trigger('swipeEnd', transitionDescription);
        }, this));

        // Transition the viewport to reveal the target element
        $surface.css({
          '-webkit-transition': this.cssTransition,
          '-moz-transition': this.cssTransition,
          '-ms-transition': this.cssTransition,
          '-o-transition': this.cssTransition,
          'transition': this.cssTransition,
          '-webkit-transform': transform,
          '-moz-transform': transform,
          '-ms-transform': transform,
          '-o-transform': transform,
          'transform': transform
        });

        this.swipe = null;
      }, this));
    },


    /**
     * Overrides default implementation to reset touch events bindings
     * on old element before setting the new content.
     *
     * @function
     * @param {String} html HTML content to set
     */
    setContent: function (html) {
      var $surface = this.$('.joshfire-inner').first();
      $surface.off('touchstart');
      $surface.off('touchmove');
      $surface.off('touchend');
      TransitionPanel.prototype.setContent.call(this, html);
    },


    /**
     * Overrides default implementation to reset touch events bindings
     * on old element
     *
     * @function
     */
    undelegateEvents: function () {
      var $surface = this.$('.joshfire-inner').first();
      $surface.off('touchstart');
      $surface.off('touchmove');
      $surface.off('touchend');
      TransitionPanel.prototype.undelegateEvents.call(this);
    }
  });

  return SlidePanel;
});
