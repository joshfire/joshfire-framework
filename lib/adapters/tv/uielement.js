define([
  'joshlib!adapters/none/uielement',
  'joshlib!vendor/underscore',
  'joshlib!utils/dollar',
  'joshlib!utils/woodman'
], function (UIElement, _, $, woodman) {
  var logger = woodman.getLogger('joshfire.framework.adapters.tv.uielement');

  var UIElementTV = UIElement.extend({

    translateY: 0,

    initialize: function (options) {
      options = options || {};

      UIElement.prototype.initialize.call(this, options);

      _.bindAll(this, 'navFocus', 'navBlur', 'processKey');

      this.focused = false;

      /* Keeps track of user defined nav functions */
      this.boundNav = [];
      var bindings = ['navUp', 'navRight', 'navDown', 'navLeft', 'navAction','navFocus','navBlur'];
      for (var index in bindings) {
        if (options[bindings[index]]) {
          this.boundNav[bindings[index]] = true;
          this[bindings[index]] = options[bindings[index]];
        }
      }

      this.scroller = options.scroller || false;
      this.offsetTop = options.offsetTop || 0;
      this.offsetBottom = options.offsetBottom || 0;
      this.focusSubElements = options.focusSubElements || false;
      this.scrollStep = options.scrollStep || 100;

      // Translate 3D for scrolling: defaults to true
      this.translate3d = (options.translate3d !== undefined) ?
        options.translate3d :
        true;
    },

    enhance: function() {
      if(this.scroller) {
        var $el = $(this.el);
        var $content = $el.children().first();

        var theNavDown = function() {
          var height = $el.height();
          var contentHeight = $content.height();
          var subElement;

          if(contentHeight < height - this.offsetBottom - this.offsetTop) {
            subElement = this.guessNextFocusableSubElement('down');
            if(subElement) this.focusSubElement(subElement);
            return;
          }

          if(this.focusSubElements) {
            subElement = this.guessNextFocusableSubElement('down');
            if(subElement)
              this.focusSubElement(subElement);
            else
              this.translateY = Math.max(height - contentHeight - this.offsetBottom - this.offsetTop, this.translateY - this.scrollStep);
          }
          else {
            this.translateY = Math.max(height - contentHeight - this.offsetBottom - this.offsetTop, this.translateY - this.scrollStep);
          }

          var translate  = 'translate3d(0,' + this.translateY + 'px,0)';
          if (this.translate3d) {
            $content.css({
              '-webkit-transform': translate,
              '-moz-transform': translate,
              '-ms-transform': translate,
              '-o-transform': translate,
              'transform': translate
            });
          }
          else {
            $content.css({
              'position': 'absolute',
              'top': this.translateY
            });
          }
        };
        /*
        * If the user chose to bind a function himself,
        * this one is set in the prototype. Else, we use it
        * as the default one.
        */
        if(this.boundNav.navDown)
          UIElementTV.prototype.navDown = theNavDown;
        else
          this.navDown = theNavDown;


        var theNavUp = function() {
          var height = $el.height();
          var contentHeight = $content.height();
          var subElement;

          if(contentHeight < height - this.offsetBottom - this.offsetTop) {
            subElement = this.guessNextFocusableSubElement('up');
            if(subElement) {
              this.focusSubElement(subElement);
            }
            return;
          }

          if(this.focusSubElements) {
            subElement = this.guessNextFocusableSubElement('up');
            if(subElement) {
              this.focusSubElement(subElement);
            }
            else {
              this.translateY = Math.min(0, this.translateY + this.scrollStep);
            }
          }
          else {
            this.translateY = Math.min(0, this.translateY + this.scrollStep);
          }

          var translate  = 'translate3d(0,' + this.translateY + 'px,0)';
          if (this.translate3d) {
            $content.css({
              '-webkit-transform': translate,
              '-moz-transform': translate,
              '-ms-transform': translate,
              '-o-transform': translate,
              'transform': translate
            });
          }
          else {
            $content.css({
              'position': 'absolute',
              'top': this.translateY
            });
          }
        };

        if (this.boundNav.navUp) {
          UIElementTV.prototype.navUp = theNavUp;
        }
        else {
          this.navUp = theNavUp;
        }
      }

      UIElement.prototype.enhance.call(this);
    },

    /**
     * Gives focus to the element.
     */
    navFocus: function(origin) {
      if (this.isFocusedElement()) {
        logger.log(this.logid, 'nav focus', 'already focused');
        return;
      }

      logger.log(this.logid, 'nav focus');
      var $el = $(this.el);

      $el.addClass('nav-focused');
      $(document).keydown(this.processKey);
      $el.click(this.processClick);
      if(origin) {
        this.origin = origin;
      }
      this.focused = true;

      $('.nav-focused-ancestor').removeClass('nav-focused-ancestor');
      $el.parents().addClass('nav-focused-ancestor');

      if (UIElementTV.focusedElement) {
        UIElementTV.focusedElement.navBlur();
      }

      if (this.focusSubElements) {
        this.getFocusableSubElements();
        var el = this.guessNextFocusableSubElement('down');
        if(el && this.isSubElementOnScreen(el))
          this.focusSubElement(el);
      }

      UIElementTV.focusedElement = this;
    },

    /**
     * Removes focus from the element.
     */
    navBlur: function() {
      logger.log(this.logid, 'nav blur');
      $(this.el).removeClass('nav-focused');
      $(document).unbind('keydown', this.processKey);
      $(this.el).unbind('click', this.processClick);
      if(this.$('.sub-nav-focused').length)
        this.$('.sub-nav-focused')[0].blur();
      this.focused = false;
    },

    /**
     * Returns true if this TV view is the focused element
     *
     * @function
     * @return {boolean} True if the the element is focused, false otherwise
     */
    isFocusedElement: function () {
      return UIElementTV.focusedElement === this;
    },

    processClick: function(event) {
      if (this.navClick) {
        return this.navClick(event);
      }
      if (this.origin) {
        this.origin.processClick(event);
      }
      return true;
    },

    /**
     * Processes a key event.
     *
     * The action is propagated to the view that gave the focus to this view
     * if it cannot be performed on this view.
     *
     * @function
     * @param {Event} event The key event to handle
     */
    processKey: function(event) {
      var code = event.keyCode;

      var runOrPropagate = _.bind(function (fn) {
        if (fn) {
          logger.log(this.logid, 'process key', 'code=' + code, 'run');
          return fn.call(this, event);
        }
        else if (this.origin) {
          logger.log(this.logid, 'process key', 'code=' + code, 'propagate');
          return this.origin.processKey(event);
        }
      }, this);

      if ((code === 38) || (code === window.VK_UP)) {
        return runOrPropagate(this.navUp);
      }
      else if ((code === 39) || (code === window.VK_RIGHT)) {
        return runOrPropagate(this.navRight);
      }
      else if ((code === 40) || (code === window.VK_DOWN)) {
        return runOrPropagate(this.navDown);
      }
      else if ((code === 37) || (code === window.VK_LEFT)) {
        return runOrPropagate(this.navLeft);
      }
      else if ((code === 13) || (code === 32) || (code === window.VK_ENTER)) {
        return runOrPropagate(this.navAction);
      }

      logger.log(this.logid, 'process key', 'code=' + code, 'not handled');
      return true;
    },

    /*
    * Look for links or buttons in the content. If there are, they will
    * be taken into account when scrolling up or down and will be focused.
    */
    getFocusableSubElements: function() {
      var elements = this.$('a[href*=h], input, button, select, textarea, command');

      this.focusableElements = [];
      for(var o = 0; o < elements.length; o++) {
        if(elements.hasOwnProperty(o) && typeof elements[o] === 'object') {
          this.focusableElements.push({
            $el: $(elements[o]),
            x: $(elements[o]).offset().left,
            y: $(elements[o]).offset().top
          });
        }
      }
    },

    focusSubElement: function(focusableElement) {
      /**
      * Remove the focus on every focusable element.
      **/
      _.each(this.focusableElements, function(num) { num.focused = false; });
      /**
      * Note : using focus() may not be our safest option.
      * This is mostly untested. (samsung, phillips, etc.)
      **/
      focusableElement.$el[0].focus();
      focusableElement.focused = true;
      $('.sub-nav-focused').removeClass('sub-nav-focused');
      focusableElement.$el.addClass('sub-nav-focused');
    },

    scrollToSubElement: function(focusableElement, direction) {
      var Y = 0;

      if(direction === 'down') {
        Y = this.translateY - focusableElement.$el.height() - this.scrollStep;
      }
      else {
        Y = this.translateY + focusableElement.$el.height() + this.scrollStep;
      }
      return Y;
    },

    guessNextFocusableSubElement: function(direction) {
      // matches contains the subelements which are currently visible on-screen
      var matches = [];
      for(var k in this.focusableElements) {
        this.focusableElements[k].index = k;
        if(this.isSubElementOnScreen(this.focusableElements[k])) {
          matches.push(this.focusableElements[k]);
        }
      }
      // Return the best match according to direction.
      if(matches.length) {
        for(var l in matches) {
          if(matches[l].focused) {
            // If we're going up, we want the previous <a>
            // We also want to fail if there's no match.
            if(direction === 'up') {
              return matches[(parseInt(l, 10) - 1)] || false;
            }
            // Else, next <a>.
            else if (direction === 'down') {
              return matches[(parseInt(l, 10) + 1)] || false;
            }
          }
        }
        return matches[0];
      }
      else {
        return false;
      }
    },

    isSubElementOnScreen: function(focusableElement) {
      if( focusableElement.y > this.translateY * -1 &&
          focusableElement.y < this.translateY * -1 + $(this.el).outerHeight()) {
        return true;
      }
      return false;
    }

  });

  return UIElementTV;
});
