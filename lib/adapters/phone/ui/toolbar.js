define(["joshlib!ui/list","joshlib!utils/dollar","joshlib!vendor/underscore"], function(UIList,$,_) {

  var UIToolbar = UIList.extend({

    tagName: 'div',
    className: 'joshfire-toolbar',

    initialize: function(options) {
      this.maxOnScreen = options.maxOnScreen || 5;
      this.margin = options.margin || 5;
      //this.arrowWidth = options.arrowWidth || .15;
      this.currPage = 0;
      this.useWindowWidth = options.useWindowWidth || false;

      UIList.prototype.initialize.call(this, options);
    },

    enhance: function() {
      var self = this;

      var resize = function() {
        if(!this.collection) return;

        this.$('.arrow').remove();

        var width;

        if(self.useWindowWidth) {
          width = window.innerWidth;
        } else {
          var rect = this.el.getBoundingClientRect();
          width = rect.width;
        }

        if(this.collection.length <= this.maxOnScreen) {
          this.$('ul').width(width);

          var itemWidth = (width - this.margin) / this.collection.length;

          this.$('li').css({
            width: itemWidth - this.margin + 'px',
            'padding-left': this.margin + 'px'
          });
        } else {

          var numPages = Math.ceil(this.collection.length / (this.maxOnScreen - 2));

          this.$('ul').css({width: numPages * width + 'px'});

          var itemWidth = Math.round((width - this.margin) / this.maxOnScreen);

          var $lis = this.$('li').css({
            width: itemWidth - this.margin + 'px',
            'padding-left': this.margin + 'px'
          });

          for (var i = this.maxOnScreen - 2; i < $lis.length; i += this.maxOnScreen - 2) {
            if(i + 1 < $lis.length) {
              $($lis[i]).after('<li class="arrow"><a href="#" class="next">next<span></span></a></li><li class="arrow"><a href="#" class="prev">prev<span></span></a></li>');
            }
          }

          this.$('.next').parent().css({
            width: itemWidth - this.margin + 'px',
            'padding-left': this.margin + 'px'
          });

          this.$('.prev').parent().css({
            width: itemWidth - this.margin + 'px',
            'padding-left': this.margin * 2 + 'px'
          });

          this.$('.next').bind('click', _.bind(function(e) {
            e.preventDefault();
            this.currPage = Math.min(numPages, this.currPage + 1);
            this.iScroller.scrollToPage.call(this.iScroller, this.currPage, 0, 200);
            return false;
          }, this));

          this.$('.prev').bind('click', _.bind(function(e) {
            e.preventDefault();
            this.currPage = Math.max(0, this.currPage - 1);
            this.iScroller.scrollToPage.call(this.iScroller, this.currPage, 0, 200);
            return false;
          }, this));
        }
      };

      // Resize the element (e.g. to fit the window's width)
      resize.call(this);

      // Add the scroller (done by the phone's adapted UIElement)
      // Note it's important to add the scroller *after* the element
      // has been resized otherwise it won't work as expected.
      UIList.prototype.enhance.call(this);

      window.addEventListener('resize', _.bind(resize, this));
    }

  });

  return UIToolbar;
});
