define(["joshlib!adapters/none/ui/cardpanel","joshlib!vendor/underscore"], function(UICardPanel,_) {

  var UITvCardPanel = UICardPanel.extend({

    navFocus: function(origin) {
      UICardPanel.prototype.navFocus.call(this, origin);
      if(this.currentChild)
        this.children[this.currentChild].navFocus(this);
    }

  });

  return UITvCardPanel;

});
