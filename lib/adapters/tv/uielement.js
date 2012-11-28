define(["joshlib!adapters/none/uielement","joshlib!vendor/underscore","joshlib!utils/dollar"], function(UIElement,_,$) {

  var UIElementTV = UIElement.extend({

    translateY: 0,

    initialize:function(options) {
      UIElement.prototype.initialize.call(this, options);

      _.bindAll(this, 'navFocus', 'navBlur', 'processKey');

      this.focused = false;

      if(options) {
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
      }
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
          $content.css({
            '-webkit-transform': translate,
            '-moz-transform': translate,
            '-ms-transform': translate,
            '-o-transform': translate,
            'transform': translate
          });
        };
        /*
        * If the user chose to bind a function himself,
        * this one is set in the prototype. Else, we use it
        * as the default one.
        */
        if(this.boundNav['navDown'])
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
            if(subElement)
              this.focusSubElement(subElement);
            else
              this.translateY = Math.min(0, this.translateY + this.scrollStep);
          
          }
          else {
            this.translateY = Math.min(0, this.translateY + this.scrollStep);
          }
          
          var translate  = 'translate3d(0,' + this.translateY + 'px,0)';
          $content.css({
            '-webkit-transform': translate,
            '-moz-transform': translate,
            '-ms-transform': translate,
            '-o-transform': translate,
            'transform': translate
          });
        };
        if(this.boundNav['navUp']) {
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
      if(this === UIElementTV.focusedElement) {
        return;
      }

      var $el = $(this.el);

      $el.addClass('nav-focused');
      $(document).keydown(this.processKey);
      if(origin) {
        this.origin = origin;
      }
      this.focused = true;

      $('.nav-focused-ancestor').removeClass('nav-focused-ancestor');
      $el.parents().addClass('nav-focused-ancestor');

      if(UIElementTV.focusedElement) {
        UIElementTV.focusedElement.navBlur();
      }

      if(this.focusSubElements) {
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
      $(this.el).removeClass('nav-focused');
      $(document).unbind('keydown', this.processKey);
      if(this.$('.sub-nav-focused').length)
        this.$('.sub-nav-focused')[0].blur();
      this.focused = false;
    },

    /**
     * Processes a key event.
     */
    processKey: function(event) {
      switch(event.keyCode) {
        case 38:
        if(this.navUp) {
          return this.navUp(event);
        }
        break;
        case 39:
        if(this.navRight) {
          return this.navRight(event);
        }
        break;
        case 40:
        if(this.navDown) {
          return this.navDown(event);
        }
        break;
        case 37:
        if(this.navLeft) {
          return this.navLeft(event);
        }
        break;
        case 13: case 32:
        if(this.navAction) {
          return this.navAction(event);
        }
        break;
      }

      if(this.origin) {
        switch(event.keyCode) {
          case 38: case 39: case 40: case 37: case 13: case 32:
          return this.origin.processKey(event);
          break;
        }
      }

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

      if(direction === 'down')
        Y = this.translateY - focusableElement.$el.height() - this.scrollStep;
      else
        Y = this.translateY + focusableElement.$el.height() + this.scrollStep;
      
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
