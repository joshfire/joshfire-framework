define(["joshlib!adapters/none/ui/slidepanel","joshlib!vendor/underscore"], function(UISlidePanel,_) {

  var UITvSlidePanel = UISlidePanel.extend({

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
        'left': this.translateX,
        'top': this.translateY
      });

    }
  });

  return UITvSlidePanel;

});