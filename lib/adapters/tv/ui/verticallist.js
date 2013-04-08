define([
  'joshlib!ui/list',
  'joshlib!utils/dollar',
  'joshlib!utils/woodman',
  'joshlib!vendor/underscore'
], function (UIList, $, woodman, _) {
  var logger = woodman.getLogger('joshfire.framework.adapters.tv.ui.verticallist');

  var UIVerticalList = UIList.extend({
    initialize: function(options) {
      options = options || {};

      this.initializeLogId(options);
      logger.log(this.logid, 'initialize',
        'autoLoadMore=' + !!options.autoLoadMore,
        'offsetTop=' + (options.offsetTop || 0),
        'offsetBottom=' + (options.offsetBottom || 0));

      // Save the "autoLoadMore" setting but disable base List behavior
      // as this view handles user moves using "discrete scroll" actions.
      var autoLoadMore = options.autoLoadMore;
      options.autoLoadMore = false;

      UIList.prototype.initialize.call(this, options);

      this.autoLoadMore = autoLoadMore;
      this.active = -1;
      this.offsetTop = options.offsetTop || 0;
      this.offsetBottom = options.offsetBottom || 0;

      // Translate 3D : defaults to true
      this.translate3d = (options.translate3d !== undefined) ?
        options.translate3d :
        true;

      $(window).resize(_.bind(function () {
        logger.log(this.logid, 'window resized', 'transform accordingly');
        if (this.active !== -1) {
          this.calculateTransform(this.active);
        }
      }, this));

      this.listenTo(this, 'render:children', function () {
        logger.log(this.logid, 'children rendered', 'transform accordingly');
        if (this.active !== -1) {
          this.calculateTransform(this.active);
        }
      });
    },

    navFocus: function(origin) {
      if (this.isFocusedElement()) {
        logger.log(this.logid, 'nav focus', 'already focused');
        return;
      }

      logger.log(this.logid, 'nav focus', 'active=' + this.active);
      UIList.prototype.navFocus.call(this, origin);

      if (this.collection.length) {
        if (this.active === -1) {
          this.activate(0);
        } else {
          this.activate(this.active);
        }
      }
    },

    navBlur: function() {
      logger.log(this.logid, 'nav blur', 'active=' + this.active);
      UIList.prototype.navBlur.call(this);

      this.$('.nav-active').removeClass('nav-active');
    },

    navDown: function() {
      logger.log(this.logid, 'nav down', 'active=' + this.active);
      if(this.collection.length) {
        this.activate(Math.min(this.active + 1, this.collection.length - 1));
        if (this.autoLoadMore && this.active > this.collection.length - 5) {
          this.loadMore();
        }
      }
    },

    navUp: function() {
      logger.log(this.logid, 'nav up', 'active=' + this.active);
      if(this.collection.length) {
        this.activate(Math.max(this.active - 1, 0));
      }
    },

    navAction: function() {
      logger.log(this.logid, 'nav action', 'active=' + this.active);
      if(this.items.length) {
        var $item = $(this.items[this.active].$el);
        var $link = $item.find('a');

        if($link.length) {
          window.location = $link.attr('href');
        }
      }
    },

    navRight: function() {
      logger.log(this.logid, 'nav right', 'active=' + this.active);
      this.navAction();
    },
    navLeft:function(){
      logger.log(this.logid, 'nav left', 'active=' + this.active);
      this.origin.navFocus();
    },

    activate: function(num) {
      logger.log(this.logid, 'activate', 'num=' + num);
      this.$('.nav-active').removeClass('nav-active');

      if (!this.items || !this.items.length || !this.items[num]){
        //invalid param
        return false;
      }
      var $item = this.items[num].$el;
      $item.addClass('nav-active');

      this.active = num;
      this.calculateTransform(num);
    },

    calculateTransform: function(num) {
      var $ul = this.$('ul'),
          $lastChild = $(this.items[this.items.length - 1].$el);

      var ulHeight = $ul.height();
      var height = this.$el.height();
      var translateY = 0;
      if (ulHeight > height) {
        translateY = -num * (ulHeight - height + $lastChild.height()) / this.items.length;
      }
      logger.log(this.logid, 'compute transform', 'translateY=' + translateY);

      var translate  = 'translate3d(0,' + translateY + 'px,0)';
      if (this.translate3d) {
        $ul.stop().css({
          '-webkit-transform': translate,
          '-moz-transform': translate,
          '-ms-transform': translate,
          '-o-transform': translate,
          'transform': translate
        });
      }
      else {
        $ul.css({
          'top': translateY
        });
      }

      /* Position list indicator over the active element */
      if (ulHeight > height) {
        $(this.el).find('.list-indicator').stop().css({
          top: this.offsetTop + (height - this.offsetTop - this.offsetBottom -$lastChild.height()) * num / this.items.length
        });
      } else {
        $(this.el).find('.list-indicator').stop().css({
          top: this.offsetTop + (ulHeight - this.offsetTop - this.offsetBottom) * num / this.items.length
        });
      }
    }
  });

  return UIVerticalList;
});
