define(["joshlib!adapters/none/uielement","joshlib!inputs/remote","joshlib!vendor/underscore","joshlib!utils/dollar"], function(UIElement,Remote,_,$) {

  var UIElementTV = UIElement.extend({

    initialize:function(options) {
      UIElement.prototype.initialize.call(this, options);

      _.bindAll(this, 'navFocus', 'navBlur', 'processKey');

      this.focused = false;

      if(options) {
        var bindings = ['navUp', 'navRight', 'navDown', 'navLeft', 'navAction','navFocus','navBlur'];
        for (index in bindings){
          if (options[bindings[index]]){
            this[bindings[index]] = options[bindings[index]];
          }
        }

        this.scroller = options.scroller || false;
        this.offsetTop = options.offsetTop || 0;
        this.offsetBottom = options.offsetBottom || 0;
      }
    },

    enhance: function() {
      if(this.scroller) {
        var $el = $(this.el);
        var $content = $el.children().first();
        var translateY = 0;

        this.navDown = function() {

          var height = $el.height();
          var contentHeight = $content.height();

          if(contentHeight < height - this.offsetBottom - this.offsetTop) {
            return;
          }

          translateY = Math.max(height - contentHeight - this.offsetBottom - this.offsetTop, translateY - 100);

          var translate  = 'translate3d(0,' + translateY + 'px,0)';

          $content.css({
            '-webkit-transform': translate,
            '-moz-transform': translate,
            '-ms-transform': translate,
            '-o-transform': translate,
            'transform': translate
          });
        };

        this.navUp = function() {
          var height = $el.height();
          var contentHeight = $content.height();


          if(contentHeight < height - this.offsetBottom - this.offsetTop) {
            return;
          }

          translateY = Math.min(0, translateY + 100);

          var translate  = 'translate3d(0,' + translateY + 'px,0)';

          $content.css({
            '-webkit-transform': translate,
            '-moz-transform': translate,
            '-ms-transform': translate,
            '-o-transform': translate,
            'transform': translate
          });
        };
      }
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
      $(document.body).keydown(this.processKey);
      this.origin = origin;
      this.focused = true;

      $('.nav-focused-ancestor').removeClass('nav-focused-ancestor');
      $el.parents().addClass('nav-focused-ancestor');

      if(UIElementTV.focusedElement) {
        UIElementTV.focusedElement.navBlur();
      }

      UIElementTV.focusedElement = this;
    },

    /**
     * Removes focus from the element.
     */
    navBlur: function() {
      $(this.el).removeClass('nav-focused');
      $(document.body).unbind('keydown', this.processKey);
      this.focused = false;
    },

    /**
     * Processes a key event.
     */
    processKey: function(event) {
      console.log('test')
      switch(event.keyCode) {
        case 38: case window.VK_UP:
        if(this.navUp) {
          return this.navUp(event);
        }
        break;
        case 39: case window.VK_RIGHT:
        if(this.navRight) {
          return this.navRight(event);
        }
        break;
        case 40: case window.VK_DOWN:
        if(this.navDown) {
          return this.navDown(event);
        }
        break;
        case 37: case window.VK_LEFT:
        if(this.navLeft) {
          return this.navLeft(event);
        }
        break;
        case 13: case 32: case window.VK_ENTER:
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
    }
  });

  return UIElementTV;
});
