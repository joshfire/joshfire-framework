/**
 * @fileoverview A "basic" layout is a container view that features:
 * a title bar, a toolbar, and a main view implemented as a card panel
 *
 * The layout is basic in the sense that most applications follow a
 * similar pattern.
 *
 * The view does not impose any particular position for its children.
 */
define([
  'joshlib!ui/layout',
  'joshlib!ui/titlebar',
  'joshlib!adapters/phone/ui/toolbar',
  'joshlib!ui/cardpanel'
], function (UILayout, UITitlebar, UIToolbar, UICardPanel) {

  var UIBasicLayout = UILayout.extend({
    initialize: function (options) {
      // Create the three sub views
      options.children = {
        titlebar: new UITitlebar(options.titlebarOptions),
        toolbar: new UIToolbar(options.toolbarOptions),
        panels: new UICardPanel(options.panelsOptions)
      };
      UILayout.prototype.initialize.call(this, options);
    }
  });

  return UIBasicLayout;
});