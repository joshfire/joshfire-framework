define(["joshlib!adapters/none/ui/cardpanel","joshlib!vendor/underscore"], function(UICardPanel,_) {

  var UITvCardPanel = UICardPanel.extend({

    showChildren:function(childrenId) {
      this.activeId = childrenId;

      return UICardPanel.prototype.showChildren.call(this, childrenId);
    },

    navFocus: function(origin) {
      UICardPanel.prototype.navFocus.call(this, origin);

      this.children[this.activeId].navFocus(this);
    }

  });

  return UITvCardPanel;

});
