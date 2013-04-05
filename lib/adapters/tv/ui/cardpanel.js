define([
  'joshlib!adapters/none/ui/cardpanel'
], function (CardPanel) {

  var TVCardPanel = CardPanel.extend({
    /**
     * Gives the focus to the active child
     */
    navFocus: function (origin, event) {
      CardPanel.prototype.navFocus.call(this, origin, event);
      this.children[this.currentChild].navFocus(this);
    }
  });

  return TVCardPanel;
});
