define(['joshlib!uielement', 'joshlib!ui/titlebar', 'joshlib!adapters/phone/ui/toolbar', 'joshlib!ui/cardpanel', 'joshlib!utils/dollar', 'joshlib!vendor/underscore'], function(UIElement,UITitlebar,UIToolbar,UICardPanel,$,_) {

  var UIBasicLayout = UIElement.extend({
    initialize: function(options) {
      if (options.templateEl) {
        this.template = this.compileTemplate($(options.templateEl).html());
      }

      this.titlebar = new UITitlebar(options.titlebarOptions);
      this.toolbar = new UIToolbar(options.toolbarOptions);
      this.panels = new UICardPanel(options.panelsOptions);

      UIElement.prototype.initialize.call(this, options);
    },

    render: function() {
      this.titlebar.render();
      this.toolbar.render();
      this.panels.render();
    }
  });

  return UIBasicLayout;
});