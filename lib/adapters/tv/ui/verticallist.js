define(["joshlib!ui/list","joshlib!utils/dollar","joshlib!vendor/underscore"], function(UIList,$,_) {

  var UIVerticalList = UIList.extend({
    initialize: function(options) {
      options = options || {};

      UIList.prototype.initialize.call(this, options);

      this.active = -1;

      this.offsetTop = options.offsetTop || 0;
      this.offsetBottom = options.offsetBottom || 0;

      //Translate 3D : defaults to true
      this.translate3d = options.translate3d !== undefined ? options.translate3d :true;
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

      //this.$('.nav-active').removeClass('nav-active');
    },

    navDown: function() {
      if(this.collection.length) {
        this.activate(Math.min(this.active + 1, this.collection.length - 1));
      }
    },

    navUp: function() {
      if(this.collection.length) {
        this.activate(Math.max(this.active - 1, 0));
      }
    },

    navAction: function() {
      if(this.items.length) {
        var $item = $(this.items[this.active].view.el);
        var $link = $item.find('a');

        if($link.length) {
          window.location = $link.attr('href');
        }
      }
    },

    navRight: function() {
      this.navAction();
    },

    activate: function(num) {
      this.$('.nav-active').removeClass('nav-active');

      if (!this.items || !this.items.length || !this.items[num] || !this.items[num].view){
        //invalid param
        return false;
      }
      var $item = $(this.items[num].view.el);
      var $ul = this.$('ul');

      $item.addClass('nav-active');


      this.active = num;


      var $lastChild = $(this.items[this.items.length - 1].view.el);


      /* translate 3D */
      if (this.translate3d){
        var ulHeight = $ul.height();
        var height = $(this.el).height();
        var translateY = 0;
        if(ulHeight > height) {
          translateY = -num * (ulHeight - height + $lastChild.height()) / this.items.length;
        }

        var translate  = 'translate3d(0,' + translateY + 'px,0)';

        $ul.css({
          '-webkit-transform': translate,
          '-moz-transform': translate,
          '-ms-transform': translate,
          '-o-transform': translate,
          'transform': translate
        });

        /* scrollbar */
        if (ulHeight > height) {
          $(this.el).find('.list-indicator').css({
            top: this.offsetTop + (height - this.offsetTop - this.offsetBottom -$lastChild.height()) * num / this.items.length
          });
        }
        else {
          $(this.el).find('.list-indicator').css({
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
