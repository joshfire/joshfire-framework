define([
  'joshlib!ui/list',
  'joshlib!utils/dollar',
  'joshlib!vendor/underscore'
], function (UIList, $, _) {

  var UIVerticalList = UIList.extend({
    initialize: function(options) {
      options = options || {};

      // Save the "autoLoadMore" setting but disable base List behavior
      // as this view handles user moves using "discrete scroll" actions.
      var autoLoadMore = options.autoLoadMore;
      options.autoLoadMore = false;

      UIList.prototype.initialize.call(this, options);

      this.autoLoadMore = autoLoadMore;
      this.active = -1;
      this.offsetTop = options.offsetTop || 0;
      this.offsetBottom = options.offsetBottom || 0;

      //Translate 3D : defaults to true
      this.translate3d = options.translate3d !== undefined ? options.translate3d :true;

      this.cumulativeHeight = this.itemsHeight = 0;
      $(window).resize(_.bind(function () {
        if (this.active !== -1) {
          this.calculateTransform(this.active);
        }
      }, this));
    },

    /**
     * Success handler called at the end of a fetch.
     *
     * Overrides base class to force a "resize" of the grid and thus allow
     * the user to move within the items that may have been added.
     */
    syncSuccessHandler: function() {
      UIList.prototype.syncSuccessHandler.call(this);
      if (this.active !== -1) {
        this.calculateTransform(this.active);
      }
    },

    navFocus: function(origin) {
      UIList.prototype.navFocus.call(this, origin);

      if(this.collection.length) {
        if(this.active === -1) {
          this.activate(0);
        } else {
          this.activate(this.active);
        }
      }
    },

    navBlur: function() {
      UIList.prototype.navBlur.call(this);

      this.$('.nav-active').removeClass('nav-active');
    },

    navDown: function() {
      if(this.collection.length) {
        this.activate(Math.min(this.active + 1, this.collection.length - 1));
        if (this.autoLoadMore && this.active > this.collection.length - 5) {
          this.loadMore();
        }
      }
    },

    navUp: function() {
      if(this.collection.length) {
        this.activate(Math.max(this.active - 1, 0));
      }
    },

    navAction: function() {
      if(this.items.length) {
        var $item = $(this.items[this.active].$el);
        var $link = $item.find('a');

        if($link.length) {
          window.location = $link.attr('href');
        }
      }
    },

    navRight: function() {
      this.navAction();
    },
    navLeft:function(){
      this.origin.navFocus();
    },

    activate: function(num) {
      this.$('.nav-active').removeClass('nav-active');

      if (!this.items || !this.items.length || !this.items[num]){
        //invalid param
        return false;
      }
      var $item = this.items[num].$el;
      $item.addClass('nav-active');

      this.active = num;

      if (this.translate3d) {
        this.calculateTransform(num);
      }

    },

    setChildrenElements: function(startFrom) {
      UIList.prototype.setChildrenElements.call(this, startFrom);
      _(this.items).each(_.bind(function(item) {
        this.itemsHeight += item.$el.height();
      }, this));
    },

    calculateTransform: function(num) {
      var $ul = this.$('ul'),
          $lastChild = $(this.items[this.items.length - 1].$el);

      /* translate 3D */
      if (this.translate3d) {
        var ulHeight = $ul.height();
        var height = this.$el.height();
        var translateY = 0;
        if(ulHeight > height) {
          translateY = -num * (ulHeight - height + $lastChild.height()) / this.items.length;
        }

        var translate  = 'translate3d(0,' + translateY + 'px,0)';

        $ul.stop().css({
          '-webkit-transform': translate,
          '-moz-transform': translate,
          '-ms-transform': translate,
          '-o-transform': translate,
          'transform': translate
        });

        /* scrollbar */
        if (ulHeight > height) {
          $(this.el).find('.list-indicator').stop().css({
            top: this.offsetTop + (height - this.offsetTop - this.offsetBottom -$lastChild.height()) * num / this.items.length
          });
        } else {
          $(this.el).find('.list-indicator').stop().css({
            top: this.offsetTop + (ulHeight - this.offsetTop - this.offsetBottom) * num / this.items.length
          });
        }
        /* /scrollbar */
      }
      /* /translate */
    }

  });

  return UIVerticalList;
});
