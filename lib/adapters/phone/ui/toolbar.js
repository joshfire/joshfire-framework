define(["joshlib!ui/list","joshlib!utils/dollar","joshlib!vendor/underscore"], function(UIList,$,_) {

  var UIToolbar = UIList.extend({

    tagName: 'div',
    className: 'joshfire-toolbar',

    initialize: function(options) {
      this.maxOnScreen = options.maxOnScreen || 5;
      this.margin = options.margin || 5;
      //this.arrowWidth = options.arrowWidth || .15;
      this.currPage = 0;

      UIList.prototype.initialize.call(this, options);
    },

    enhance: function() {
      UIList.prototype.enhance.call(this);

      var resize = function() {
        if(!this.collection) return;

        this.$('.arrow').remove();

        var width = window.innerWidth;

        if(this.collection.length <= this.maxOnScreen) {
          this.$('> ul').width(width);

          var itemWidth = (width - this.margin) / this.collection.length;

          this.$('li').css({
            width: itemWidth - this.margin,
            paddingLeft: this.margin
          });
        } else {

          var numPages = Math.ceil(this.collection.length / (this.maxOnScreen - 1));

          this.$('ul').css({width: numPages * width + 'px'});

          var itemWidth = Math.round((width - this.margin) / this.maxOnScreen);

          var $lis = this.$('li').css({
            width: itemWidth - this.margin,
            paddingLeft: this.margin
          });

          for (var i = this.maxOnScreen - 2; i < $lis.length; i += this.maxOnScreen - 1) {
            if(i + 1 < $lis.length) {
              $($lis[i]).after('<li class="arrow"><a href="#" class="next">next<span></span></a></li><li class="arrow"><a href="#" class="prev">prev<span></span></a></li>');
            }
          };

          this.$('.next').parent().css({
            width: itemWidth - this.margin,
            paddingLeft: this.margin
          });

          this.$('.prev').parent().css({
            width: itemWidth - this.margin,
            paddingLeft: this.margin * 2
          });

          this.$('.next').bind('click', _.bind(function() {
            this.currPage = Math.min(numPages, this.currPage + 1);
            this.iScroller.scrollToPage.call(this.iScroller, this.currPage, 0, 200);
            return false;
          }, this));

          this.$('.prev').bind('click', _.bind(function() {
            this.currPage = Math.max(0, this.currPage - 1);
            this.iScroller.scrollToPage.call(this.iScroller, this.currPage, 0, 200);
            return false;
          }, this));
        }
      }

      resize.call(this);

      window.addEventListener('resize', _.bind(resize, this));
    }

  });

  return UIToolbar;
});