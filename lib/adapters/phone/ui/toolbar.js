define([
  'joshlib!ui/list',
  'joshlib!utils/dollar',
  'joshlib!vendor/underscore'
], function(
  UIList,
  $,
  _
) {

  var UIToolbar = UIList.extend({

    tagName: 'div',
    className: 'joshfire-toolbar',

    initialize: function(options) {
      this.maxOnScreen = options.maxOnScreen || 5;
      this.margin = options.margin || 5;
      //this.arrowWidth = options.arrowWidth || .15;
      this.currPage = 0;
      this.useWindowWidth = options.useWindowWidth || false;
      this.minLengthToShow = options.minLengthToShow;

      UIList.prototype.initialize.call(this, options);
    },

    generate: function(cb) {
      if (this.items.length < this.minLengthToShow) {
        $('body').addClass('no-toolbar');
      }
      UIList.prototype.generate.call(this,cb);
    },

    enhance: function() {
      var self = this;

      var resize = function() {
        if(!this.collection) return;

        this.$('.arrow').remove();

        var width;
        var itemWidth;

        if(self.useWindowWidth) {
          width = window.innerWidth;
        } else {
          var rect = this.el.getBoundingClientRect();
          width = rect.width;
        }

        if(this.collection.length <= this.maxOnScreen) {
          this.$('ul').width(width);

          itemWidth = (width - this.margin) / this.collection.length;

          this.$('li').css({
            width: itemWidth - this.margin + 'px',
            'padding-left': this.margin + 'px'
          });
        } else {

          var numPages = Math.ceil(this.collection.length / (this.maxOnScreen - 2));

          this.$('ul').css({width: numPages * width + 'px'});

          itemWidth = Math.round((width - this.margin) / this.maxOnScreen);

          var $lis = this.$('li').css({
            width: itemWidth - this.margin + 'px',
            'padding-left': this.margin + 'px'
          });

          for (var i = this.maxOnScreen - 2; i < $lis.length; i += this.maxOnScreen - 2) {
            if(i + 1 < $lis.length) {
              $($lis[i]).after('<li class="arrow"><a class="next">next<span></span></a></li><li class="arrow"><a class="prev">prev<span></span></a></li>');
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

          /**
          * Now using scrollTo instead of scrollToPage for compatibility with
          * iScroll lite
          **/
          this.$('.next').bind('click', _.bind(function(e) {
            var to = 0;
            var boundScrollTo = _.bind(this.iScroller.scrollTo, this.iScroller);

            e.preventDefault();
            this.currPage = Math.min(numPages, this.currPage + 1);
            to += this.currPage * this.maxOnScreen * itemWidth * -1;
            to += this.margin * this.currPage * -1;

            boundScrollTo(to, 0, 200);
            return false;
          }, this));

          this.$('.prev').bind('click', _.bind(function(e) {
            var to = 0;
            var boundScrollTo = _.bind(this.iScroller.scrollTo, this.iScroller);

            e.preventDefault();
            this.currPage = Math.max(0, this.currPage - 1);
            to += this.currPage * this.maxOnScreen * itemWidth * -1;
            to += this.margin * this.currPage * -1;

            boundScrollTo(to, 0, 200);
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
