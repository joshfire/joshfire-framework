/**
 * @fileOverview The grid view automates keyboard navigation by selecting
 * neighboor cells in the most natural way possible.
 */

define([
  'joshlib!ui/list',
  'joshlib!utils/dollar',
  'joshlib!utils/uid',
  'joshlib!utils/woodman',
  'joshlib!vendor/underscore'
], function (UIList, $, getid, woodman, _) {
  var logger = woodman.getLogger('joshfire.framework.adapters.tv.ui.grid');

  /**
   * A TV grid is a two-dimensional list that lets the user navigate with a
   * keyboard.
   *
   * The grid maintains the index of the active item within the list and
   * automatically computes the indexes of the items that the user should
   * navigate to if he wants to go left, right, up or down.
   *
   * @class
   */
  var UIGrid = UIList.extend({

    initialize: function (options) {
      options = options || {};

      this.logid = this.logid || options.logid ||
        this.id || options.id ||
        '' + (options.name ? options.name : 'view') + '-' + getid();
      logger.log(this.logid, 'initialize',
        'autoLoadMore=' + !!options.autoLoadMore,
        'tolerance=' + (options.tolerance || 20));

      // Save the "autoLoadMore" setting but disable base List behavior
      // as the list scrolling does not quite match the way grids work.
      var autoLoadMore = options.autoLoadMore;
      options.autoLoadMore = false;

      UIList.prototype.initialize.call(this, options);

      this.autoLoadMore = autoLoadMore;
      this.active = -1;
      this.translateY = 0;
      this.tolerance = options.tolerance || 20;

      this.listenTo(this, 'render:children', function () {
        logger.log(this.logid, 'children rendered', 'resize grid');
        this.$lis = this.$('li');
        this.resize();
      });
    },

    enhance: function () {
      this.$lis = this.$('li');
      $(window).resize(_.bind(this.resize, this));
      this.resize();
      UIList.prototype.enhance.call(this);
    },

    /**
     * Computes the positions of the corners of all items in the list as well
     * as the positions of their center.
     *
     * The function does not compute the boundings if the elements are not
     * visible. This would lead to a loss of focus inside the grid since the
     * boundings would be wrong (this happens in Sleek if a user selects and
     * changes the tab really fast). The boundings will get computed on focus
     * in that case.
     *
     * @function
     */
    resize: function () {
      logger.log(this.logid, 'resize');

      this.boundingsComputed = false;
      this.bottom = 0;
      this.maxItemHeight = 0;

      if (!this.$lis || !this.$lis.is(':visible')) {
        logger.log(this.logid, 'resize', 'no visible item');
        return;
      }

      if (this.$lis && this.$lis.is(':visible')) {
        logger.log(this.logid, 'resize',
          'items=' + this.$lis.length,
          'translateY=' + this.translateY);
        this.boundingRects = this.$lis.map(_.bind(function (i, el) {
          this.maxItemHeight = Math.max(
            $(el).height(), this.maxItemHeight);
          return el.getBoundingClientRect();
        }, this));

        this.leftBounds = this.boundingRects.map(function (i, rect) {
          return rect.left;
        });

        this.rightBounds = this.boundingRects.map(function (i, rect) {
          return rect.right;
        });

        this.topBounds = this.boundingRects.map(_.bind(function (i, rect) {
          return rect.top - this.translateY;
        }, this));

        this.bottomBounds = this.boundingRects.map(_.bind(function (i, rect) {
          var bottom = rect.bottom - this.translateY;
          this.bottom = Math.max(this.bottom, bottom);
          return bottom;
        }, this));

        this.centers = this.boundingRects.map(function (i, rect) {
          return {
            x: rect.left + rect.width * 0.5,
            y: rect.top + rect.height * 0.5
          };
        });

        this.boundingsComputed = true;

        logger.log(this.logid, 'resize',
          'maxItemHeight=' + this.maxItemHeight,
          'bottom=' + this.bottom);
      }
    },

    /**
     * Activates the item in the list
     *
     * @function
     * @param {integer} num The index of the item to activate in the list
     */
    activate: function (num) {
      logger.log(this.logid, 'activate', 'num=' + num);
      this.$('.nav-active').removeClass('nav-active');

      var $item = this.items[num].$el;

      $item.addClass('nav-active');
      var $ul = this.$('ul');

      this.active = num;

      var top = this.topBounds[num];
      var bottom = this.bottomBounds[num];
      var height = $(this.el).height();

      if (bottom + this.translateY > this.el.getBoundingClientRect().bottom) {
        this.translateY = Math.max(
          height - bottom - 100,
          height - $ul.height());
        logger.log(this.logid, 'activate', 'bottom adjust',
          'translateY=' + this.translateY);
      } else if (top + this.translateY <= this.el.getBoundingClientRect().top) {
        this.translateY = -top;
        logger.log(this.logid, 'activate', 'top adjust',
          'translateY=' + this.translateY);
      }

      // Check if we are in the last two rows
      // Add 10 so the row above the two last one
      // don't trigger the load more
      if (this.autoLoadMore &&
          ((bottom + 2 * (this.maxItemHeight)) > this.bottom + 10)) {
        this.loadMore();
      }

      // Scroll the view to the computed translation value
      if (this.translateY) {
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

    navFocus: function (origin) {
      logger.log(this.logid, 'nav focus', 'active=' + this.active);
      UIList.prototype.navFocus.call(this, origin);

      if (!this.boundingsComputed) {
        this.resize();
      }

      if (this.collection.length) {
        if(this.active === -1) {
          this.activate(0);
        } else {
          this.activate(this.active);
        }
      }
    },

    navBlur: function () {
      logger.log(this.logid, 'nav blur', 'active=' + this.active);
      UIList.prototype.navBlur.call(this);

      this.$('.nav-active').removeClass('nav-active');
    },

    navRight: function (event) {
      logger.log(this.logid, 'nav right', 'active=' + this.active);
      var activeRight = this.rightBounds[this.active];
      var activeCenter = this.centers[this.active];

      var min = 30000;
      var best = -1;
      var center = 0;
      var dist = 0;

      for (var i = this.leftBounds.length - 1; i >= 0; i--) {
        if (this.isRight(i)) {
          center = this.centers[i];
          dist = Math.sqrt(
            Math.pow(activeRight - this.leftBounds[i], 2) +
            Math.pow(activeCenter.y - center.y, 2));

          if ((dist < min) || (best === -1) ||
              (Math.abs(dist - min) < this.tolerance) &&
              (this.centers[i].y < this.centers[best].y)) {
            best = i;
            min = dist;
          }
        }
      }

      if ((best !== -1) && (this.collection.length > 1)) {
        logger.log(this.logid, 'nav right',
          'active=' + this.active,
          'activate=' + best);
        this.activate(best);
      }
      else if (this.origin && this.origin.navFocus) {
        logger.log(this.logid, 'nav right',
          'active=' + this.active,
          'give back focus to origin');
        this.origin.navFocus(null, event);
      }
    },

    navLeft: function(event) {
      logger.log(this.logid, 'nav left', 'active=' + this.active);
      var activeLeft = this.leftBounds[this.active];
      var activeCenter = this.centers[this.active];

      var min = 30000;
      var best = -1;
      var center = 0;
      var dist = 0;

      for (var i = this.rightBounds.length - 1; i >= 0; i--) {
        if (this.isLeft(i)) {
          center = this.centers[i];
          dist = Math.sqrt(
            Math.pow(activeLeft - this.rightBounds[i], 2) +
            Math.pow(activeCenter.y - center.y, 2));

          if ((dist < min) || (best === -1) ||
              (Math.abs(dist - min) < this.tolerance) &&
              (this.centers[i].y < this.centers[best].y)) {
            best = i;
            min = dist;
          }
        }
      }

      if ((best !== -1) && (this.collection.length > 1)) {
        logger.log(this.logid, 'nav left',
          'active=' + this.active,
          'activate=' + best);
        this.activate(best);
      }
      else if (this.origin && this.origin.navFocus) {
        logger.log(this.logid, 'nav left',
          'active=' + this.active,
          'give back focus to origin');
        this.origin.navFocus(null, event);
      }
    },

    navDown: function(event) {
      logger.log(this.logid, 'nav down', 'active=' + this.active);
      var activeBottom = this.bottomBounds[this.active];
      var activeCenter = this.centers[this.active];

      var min = 30000;
      var best = -1;
      var center = 0;
      var dist = 0;

      for (var i = this.topBounds.length - 1; i >= 0; i--) {
        if (this.isDown(i)) {
          center = this.centers[i];
          dist = Math.sqrt(
            Math.pow(activeCenter.x - center.x, 2) +
            Math.pow(activeBottom - this.topBounds[i], 2));

          if ((dist < min) || (best === -1) ||
              (Math.abs(dist - min) < this.tolerance) &&
              (this.centers[i].x < this.centers[best].x)) {
            best = i;
            min = dist;
          }
        }
      }

      if ((best !== -1) && (this.collection.length > 1)) {
        logger.log(this.logid, 'nav down',
          'active=' + this.active,
          'activate=' + best);
        this.activate(best);
      }
      else if (this.origin && this.origin.navFocus) {
        logger.log(this.logid, 'nav down',
          'active=' + this.active,
          'give back focus to origin');
        this.origin.navFocus(null, event);
      }
    },

    navUp: function(event) {
      logger.log(this.logid, 'nav up', 'active=' + this.active);
      var activeTop = this.topBounds[this.active];
      var activeCenter = this.centers[this.active];

      var min = 30000;
      var best = -1;
      var center = 0;
      var dist = 0;

      for (var i = this.bottomBounds.length - 1; i >= 0; i--) {
        if (this.isUp(i)) {
          center = this.centers[i];
          dist = Math.sqrt(
            Math.pow(activeCenter.x - center.x, 2) +
            Math.pow(activeTop - this.bottomBounds[i], 2));

          if ((dist < min) || (best === -1) ||
              (Math.abs(dist - min) < this.tolerance) &&
              (this.centers[i].x < this.centers[best].x)) {
            best = i;
            min = dist;
          }
        }
      }

      if ((best !== -1) && (this.collection.length > 1)) {
        logger.log(this.logid, 'nav up',
          'active=' + this.active,
          'activate=' + best);
        this.activate(best);
      }
      else if (this.origin && this.origin.navFocus) {
        logger.log(this.logid, 'nav up',
          'active=' + this.active,
          'give back focus to origin');
        this.origin.navFocus(null, event);
      }
    },

    navAction: function() {
      logger.log(this.logid, 'nav action', 'active=' + this.active);
      if (this.items.length) {
        var $item = $(this.items[this.active].$el);
        var $link = $item.find('a');

        if($link.length) {
          window.location = $link.attr('href');
        }
      }
    },

    navClick: function() {
      logger.log(this.logid, 'nav click', 'active=' + this.active);
      if (this.items.length) {
        var $item = $(this.items[this.active].$el);
        var $link = $item.find('a');

        if ($link.length) {
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