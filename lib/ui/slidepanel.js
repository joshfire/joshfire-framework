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
      if(!this.transitionDirection || this.transitionDirection === 'none') {
        UICardPanel.prototype.transition.call(this, fromChild, toChild);
        return;
      }

      _.each(this.children, _.bind(function(child, name) {
        if(name === fromChild || name === toChild) {
          child.show();
        } else {
          child.hide();
        }
      }, this));

      var to = this.children[toChild];
      $(to.el).css({
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0
      });

      if(fromChild) {
        var translateX = 0;
        var translateY = 0;
        var from = this.children[fromChild];
        var width = $(this.el).width();
        var height = $(this.el).height();
        var style = {
          position: 'absolute',
          width: '100%',
          height: '100%'
        }

        switch(this.transitionDirection) {
          case 'left':
            _.extend(style, {
              position: 'absolute',
              width: '100%',
              height: '100%',
              left: '100%',
              top: 0
            });
            translateX =  '-' + width + 'px';
            translateY = 0;
            break;
          case 'right':
            _.extend(style, {
              position: 'absolute',
              width: '100%',
              height: '100%',
              left: '-100%',
              top: 0
            });
            translateX =  width + 'px';
            translateY = 0;
            break;
          case 'up':
            _.extend(style, {
              position: 'absolute',
              width: '100%',
              height: '100%',
              left: 0,
              top: '100%'
            });
            translateX = 0;
            translateY =  '-' + height + 'px';
            break;
          case 'down':
            _.extend(style, {
              position: 'absolute',
              width: '100%',
              height: '100%',
              left: 0,
              top: '-100%'
            });
            translateX = 0;
            translateY =  height + 'px';
            break;
        }

        $(from.el).css(style);

        var translate = 'translate(' + translateX + ',' + translateY + ')';

        $(this.el).css({
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
      }

      _.defer(_.bind(function() {
        $(this.el).css({
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
    }
  });

  return SlidePanel;
});
