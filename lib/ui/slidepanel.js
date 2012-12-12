/*

  A slide panel.

  A card panel with a slide transition.

*/

define(["joshlib!ui/cardpanel","joshlib!vendor/underscore","joshlib!utils/dollar"], function(UICardPanel,_,$) {

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
      this.cssTransition = options.cssTransition || '.4s ease-in-out all';
      this.translateX = 0;
      this.translateY = 0;

      UICardPanel.prototype.initialize.call(this, options);
    },

    /**
     * Sets the visibile child.
     *
     * @function
     * @param {String} the name of the child
     * @param {String} direction of the transition (left, right, up, down, none)
     */
    showChild: function(name, transitionDirection) {
      this.transitionDirection = transitionDirection || 'none';

      UICardPanel.prototype.showChild.call(this, name);
    },

    /**
     * Hides the current child and shows another one using a slide transition.
     *
     * @function
     * @param {String} the name of old visible child
     * @param {String} the name of new visible child
     */
    transition: function(fromChild, toChild) {

      var to = this.children[toChild];
      var $surface = this.$('.joshfire-inner').first();
      var width = this.$el.width();
      var height = this.$el.height();

      // translateX and translateY keep track of the translate values of the viewport.
      // The current element's bounds should be their opposite value.
      var top = this.translateY*-1;
      var left = this.translateX*-1;
      var transition = this.cssTransition;

      // If there is no previous child, reset all positionings.
      // Additionally, show the target child without transition.
      if(!fromChild || !this.cssTransition || this.cssTransition === 'none') {
        this.translateX = 0;
        this.translateY = 0;
        top = 0;
        left = 0;
        transition = 'none';
      }

      // Depending on the direction, we set the position of the
      // target child and decide on how to translate the surface.
      var style = {
        position: 'absolute',
        width: '100%',
        height: '100%'
      };
      
      switch(this.transitionDirection) {
        case 'right':
          _.extend(style, {
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: (left + width) + 'px',
            top: top
          });
          this.translateX -= width;
          break;
        case 'up':
          _.extend(style, {
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: left,
            top: (top + height)
          });
          this.translateY -= height;
          break;
        case 'down':
          _.extend(style, {
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: left,
            top: (top - height)
          });
          this.translateY +=  height;
          break;
        default:
        case 'left':
          _.extend(style, {
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: (left - width) + 'px',
            top: top
          });
          this.translateX += width;
          break;
      }

      // Target element is positioned next to the current element in
      // the specified direction.
      $(to.el).css(style);

      var translate = 'translate(' + this.translateX + 'px,' + this.translateY + 'px)';

      // Time to show the target child. It won't appear since it
      // is positioned off screen for the time being.
      // (Also take that opportunity to ensure that only origin and
      // target children are displayed)
      _.each(this.children, _.bind(function(child, name) {
        if(name === fromChild || name === toChild) {
          child.show();
        } else {
          child.hide();
        }
      }, this));

      // Transition the viewport further on both axes in order
      // to reveal the target element
      $surface.css({
        '-webkit-transition': transition,
        '-moz-transition': transition,
        '-ms-transition': transition,
        '-o-transition': transition,
        'transition': transition,
        '-webkit-transform': translate,
        '-moz-transform': translate,
        '-ms-transform': translate,
        '-o-transform': translate,
        'transform': translate
      });
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
