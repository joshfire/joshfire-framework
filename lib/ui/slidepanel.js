/*

  A slide panel.

  A card panel with a slide transition.

  The DOM element should be styled via CSS with something like this:

  width: 200%; // If two pannels, otherwise n*100%
  -webkit-transition: 0.4s ease-in-out all;

  It should be contained within a div that hides overflow.

*/

define(["joshlib!ui/cardpanel","joshlib!vendor/jquery"], function(UICardPanel,$) {

  var UISlidePanel = UICardPanel.extend({

    setChildren: function(children) {

      this.childrenOffsets = {};

      var offset = 0;

      for(var s in children) {
        this.childrenOffsets[s] = offset;
        ++offset;
      }

      this.numChildren = offset;

      UICardPanel.prototype.setChildren.call(this, children);
    },

    showChildren:function(childrenId) {
      var prev = this.active;
      var next = this.children[childrenId];
      var offset = this.childrenOffsets[childrenId];
      var translateX = offset / (this.numChildren) * -100 + '%';
      var translate = 'translate(' + translateX + ',0)';

      $(this.el).css({
        '-webkit-transform': translate,
        '-moz-transform': translate,
        '-ms-transform': translate,
        '-o-transform': translate,
        'transform': translate
      });

      this.active = next;
    }

  });

  return UISlidePanel;

});