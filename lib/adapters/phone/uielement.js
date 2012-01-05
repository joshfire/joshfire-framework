define(["joshlib!adapters/none/uielement","joshlib!vendor/iscroll"], function(UIElement,iScroll) {

  var UIElementPhone = UIElement.extend({
    
    enhance:function() {
      if (this.options.scroller) {
        this.insertScroller();
      }
      UIElement.prototype.enhance.call(this);
    },

    insertScroller: function() {
      var self = this;

      this.hasScroller = true;

      //if (self.scrollOptions.active/* && self.data && self.data.length && self.htmlEl.children.length*/) {
      if (self.iScroller) self.iScroller.destroy();
      self.iScroller = new iScroll(self.$(self.el).get(0), self.options.scrollOptions||{});

      // until https://github.com/cubiq/iscroll/issues/90
      document.addEventListener("orientationChanged", function(e) {
        if (self.iScroller) self.iScroller.refresh();
      }); 
    }
  });

  return UIElementPhone;

});