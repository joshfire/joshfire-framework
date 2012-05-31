define(["joshlib!adapters/none/uielement","joshlib!vendor/iscroll","joshlib!vendor/underscore","joshlib!utils/dollar"], function(UIElement,iScroll,_,$) {

  var UIElementPhone = UIElement.extend({

    initialize:function(options) {
      if (this.options.scroller) {
        $(this.el).css({overflow:"hidden"});
      }
      if (this.options.scrollerSelector) {
        this.scrollerSelector = this.options.scrollerSelector;
      }
      UIElement.prototype.initialize.call(this, options);
    },

    enhance:function() {
      var self = this;
      if (this.options.scroller) {
        self.insertScroller();

        // Resize on image load
        var $imgs = self.$('img');

        if($imgs.length) {
          self.$('img').bind('load', function() {
            setTimeout(function() {self.iScroller.refresh();},10);
          });
        }

      }
      UIElement.prototype.enhance.call(this);
    },

    insertScroller: function() {
      var self = this;

      this.hasScroller = true;

      //if (self.scrollOptions.active) {  && self.data && self.data.length && self.htmlEl.children.length
      if (self.iScroller) self.iScroller.destroy();
      var scrollerEl = self.el;
      if (self.scrollerSelector) {
        scrollerEl = $(self.scrollerSelector, self.el).get(0) || self.el;
      }
      self.iScroller = new iScroll(scrollerEl, _.extend({
        useTransition:true,

        onScrollMove: function() {
          self.$('a').bind('click.iscrollprevent', function(e){ e.preventDefault();});
        },
        onScrollEnd : function(){
          setTimeout(function() {self.$('a').unbind('click.iscrollprevent');},100);
        }
      },self.options.scrollOptions||{}));

      // until https://github.com/cubiq/iscroll/issues/90
      document.addEventListener("orientationChanged", function(e) {
        if (self.iScroller) self.iScroller.refresh();
      });
    }
    /*

    insertScroller:function() {
      var self = this;

      self.$(self.el).addClass("container").css({"overflow":"hidden"});
      self.$(self.el).children().first().addClass("scrollable vertical");
    }
    */
  });

  return UIElementPhone;

});
