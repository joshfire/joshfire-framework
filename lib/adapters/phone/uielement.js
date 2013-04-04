define([
  "joshlib!adapters/none/uielement",
  "joshlib!vendor/iscroll",
  "joshlib!vendor/underscore"
], function (UIElement, iScroll, _) {

  var UIElementPhone = UIElement.extend({

    initialize: function (options) {
      if (this.options.scroller) {
        this.$el.css({overflow:"hidden"});
      }
      if (this.options.scrollerSelector) {
        this.scrollerSelector = this.options.scrollerSelector;
      }
      this.onScroll = this.options.onScroll || null;

      // Bind to the "shown" event to force a refresh of the scroller
      // (iScroll listens to "resize" events and may have updated the
      // size of the scroller while the view was hidden)
      // TODO: switch from "bind" to "on" when Backbone is updated
      this.listenTo(this, 'shown', function () {
        if (this.hasScroller && this.iScroller) {
          // console.log('shown force refresh');
          this.iScroller.refresh();
        }
      });

      UIElement.prototype.initialize.call(this, options);
    },

    enhance:function() {
      var self = this;
      if (this.options.scroller) {
        self.insertScroller();

        // Skiped exist if the user had clicked on the loadmore button
        // TODO : associate skiped with UIElement
        if(window.skiped) {
          self.iScroller.scrollToElement('li:nth-child('+window.skiped+')', 200);
        }

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
        scrollerEl = self.$(self.scrollerSelector).get(0) || self.el;
      }

      var options = {
        useTransition:true,

        /*
        This was terrible performance-wise and doesn't seem to be needed anymore
        onScrollMove: function() {
          self.$('a').bind('click.iscrollprevent', function(e){ e.preventDefault();});
        },
        onScrollEnd : function(){
          setTimeout(function() {self.$('a').unbind('click.iscrollprevent');},100);
        },
        */

        onBeforeScrollStart : function(e) {
          var target = e.target;

          while (target.nodeType != 1) target = target.parentNode;
          if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA'){
              e.preventDefault();
          }
        }
      };

      if (self.onScroll) {
        options.onScrollMove = function() {
          var that=this;
          if (self.scrollInterval) clearInterval(self.scrollInterval);
          self.triggerScroll(that);
          self.scrollInterval = setInterval(_.bind(function() {
            this.triggerScroll(that);
          }, self),100);
        };
        options.onScrollEnd = function() {
          if (self.scrollInterval) clearInterval(self.scrollInterval);
          self.triggerScroll(this);
        };
      }

      self.iScroller = new iScroll(scrollerEl, _.extend(options,self.options.scrollOptions||{}));
      if (self.options.scrollOptions &&
        self.options.scrollOptions.disabled) {
        // Initialize the scroller in a disabled state
        // (useful when the scroller only serves to manage explicit
        // transitions between pages as in a toolbar so as to avoid
        // conflicts between touch and click events on Android)
        self.iScroller.disable();
      }

      // until https://github.com/cubiq/iscroll/issues/90
      document.addEventListener("orientationChanged", function(e) {
        if (self.iScroller) self.iScroller.refresh();
      });
    },

    triggerScroll: function(iScroller) {
      var e = $.Event("scroll"),
          el = iScroller.wrapper;

      if (!el) return;
      e.target = el;

      if (this.onScroll) this.onScroll.call(el, e, iScroller.scrollerH, -iScroller.y, -iScroller.x);
    },

    update: function(render) {
      if (this.scrollInterval) clearInterval(this.scrollInterval);
      UIElement.prototype.update.call(this, render);
    },

    scrollTop: function() {
      if (this.hasScroller && this.iScroller) {
        this.iScroller.scrollTo(0,0,500);
      }
    }

  });

  return UIElementPhone;

});
