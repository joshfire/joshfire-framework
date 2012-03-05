define(["joshlib!adapters/none/ui/slidepanel","joshlib!vendor/underscore"], function(UISlidePanel,_) {

  var UITvSlidePanel = UISlidePanel.extend({

    showChildren: function(childrenId) {
      this.activeId = childrenId;

      return UISlidePanel.prototype.showChildren.call(this, childrenId);
    },

    navFocus: function(origin, event) {
      UISlidePanel.prototype.navFocus.call(this, origin, event);

      this.children[this.activeId].navFocus(this);
    }

  });

  return UITvSlidePanel;

});