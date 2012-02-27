/**
 * The grid view tries to automate navigation by selecting neighboor cells in
 * the most natural way possible.
 */

define(["joshlib!ui/list","joshlib!utils/dollar","joshlib!vendor/underscore"], function(UIList,$,_) {

  var UIGrid = UIList.extend({

    initialize: function(options) {
      options = options || {};

      UIList.prototype.initialize.call(this, options);

      this.active = -1;
      this.translateY = 0;
      this.tolerance = options.tolerance || 20;
    },

    enhance: function() {
      UIList.prototype.enhance.call(this);

      this.$lis = this.$('li');

      $(window).resize(_.bind(this.resize, this));

      this.resize();
    },

    resize: function() {
      this.boundingRects = this.$lis.map(function(i, el) {
        return el.getBoundingClientRect();
      });

      this.leftBounds = this.boundingRects.map(function(i, rect) {
        return rect.left;
      });

      this.rightBounds = this.boundingRects.map(function(i, rect) {
        return rect.right;
      });

      this.topBounds = this.boundingRects.map(function(i, rect) {
        return rect.top;
      });

      this.bottomBounds = this.boundingRects.map(function(i, rect) {
        return rect.bottom;
      });

      this.centers = this.boundingRects.map(function(i, rect) {

        return {
          x: rect.left + rect.width * .5,
          y: rect.top + rect.height * .5
        };
      });
    },

    activate: function(num) {
      this.$('.nav-active').removeClass('nav-active');

      var $item = $(this.items[num].view.el);
      $item.addClass('nav-active');
      var $ul = this.$('ul');

      this.active = num;

      var top = this.topBounds[num];
      var bottom = this.bottomBounds[num];
      var height = $(this.el).height();

      if(bottom + this.translateY > this.el.getBoundingClientRect().bottom) {
        this.translateY = Math.max(height - bottom - 100, -$ul.height() + height);
      } else if(top + this.translateY <= this.el.getBoundingClientRect().top) {
        this.translateY = -top;
      }

      if(this.translateY) {
        var translate  = 'translate3d(0,' + this.translateY + 'px,0)';

        $ul.css({
          '-webkit-transform': translate,
          '-moz-transform': translate,
          '-ms-transform': translate,
          '-o-transform': translate,
          'transform': translate
        });
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

    navRight: function(event) {
      var activeRight = this.rightBounds[this.active];
      var activeCenter = this.centers[this.active];

      var min = 30000;
      var best = -1;

      for (var i = this.leftBounds.length - 1; i >= 0; i--) {
        if(this.isRight(i)) {

          var center = this.centers[i];
          var dist = Math.sqrt(Math.pow(activeRight - this.leftBounds[i], 2) + Math.pow(activeCenter.y - center.y, 2));

          if(Math.abs(dist - min) < this.tolerance && this.centers[i].y < this.centers[best].y || dist < min || best === -1) {
            best = i;
            min = dist;
          }
        }
      };

      if(best !== -1) {
        this.activate(best);
      } else if(this.origin) {
        this.origin.processKey(event);
      }
    },

    navLeft: function(event) {
      var activeLeft = this.leftBounds[this.active];
      var activeCenter = this.centers[this.active];

      var min = 30000;
      var best = -1;

      for (var i = this.rightBounds.length - 1; i >= 0; i--) {
        if(this.isLeft(i)) {

          var center = this.centers[i];
          var dist = Math.sqrt(Math.pow(activeLeft - this.rightBounds[i], 2) + Math.pow(activeCenter.y - center.y, 2));

          if(Math.abs(dist - min) < this.tolerance && this.centers[i].y < this.centers[best].y || dist < min || best === -1) {
            best = i;
            min = dist;
          }
        }
      };

      if(best !== -1) {
        this.activate(best);
      } else if(this.origin) {
        this.origin.processKey(event);
      }
    },

    navDown: function(event) {
      var activeBottom = this.bottomBounds[this.active];
      var activeCenter = this.centers[this.active];

      var min = 30000;
      var best = -1;

      for (var i = this.topBounds.length - 1; i >= 0; i--) {
        if(this.isDown(i)) {

          var center = this.centers[i];
          var dist = Math.sqrt(Math.pow(activeCenter.x - center.x, 2) + Math.pow(activeBottom - this.topBounds[i], 2));

          if(Math.abs(dist - min) < this.tolerance && this.centers[i].x < this.centers[best].x || dist < min || best === -1) {
            best = i;
            min = dist;
          }
        }
      };

      if(best !== -1) {
        this.activate(best);
      } else if(this.origin) {
        this.origin.processKey(event);
      }
    },

    navUp: function(event) {
      var activeTop = this.topBounds[this.active];
      var activeCenter = this.centers[this.active];

      var min = 30000;
      var best = -1;

      for (var i = this.bottomBounds.length - 1; i >= 0; i--) {
        if(this.isUp(i)) {

          var center = this.centers[i];
          var dist = Math.sqrt(Math.pow(activeCenter.x - center.x, 2) + Math.pow(activeTop - this.bottomBounds[i], 2));

          if(Math.abs(dist - min) < this.tolerance && this.centers[i].x < this.centers[best].x || dist < min || best === -1) {
            best = i;
            min = dist;
          }
        }
      };

      if(best !== -1) {
        this.activate(best);
      } else if(this.origin) {
        this.origin.processKey(event);
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

    isLeft: function(i) {
      return (
        this.rightBounds[i] <= this.leftBounds[this.active] + this.tolerance
      );
    },

    isRight: function(i) {
      return (
        this.leftBounds[i] >= this.rightBounds[this.active] - this.tolerance
      );
    },

    isUp: function(i) {
      return (
        this.bottomBounds[i] <= this.topBounds[this.active] + this.tolerance
      );
    },

    isDown: function(i) {
      return (
        this.topBounds[i] >= this.bottomBounds[this.active] - this.tolerance
      );
    }

  });

  return UIGrid;
});