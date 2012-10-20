/*!
 * Joshfire Framework 0.9.1
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jul 20 20:23:43 2011
 */

Joshfire.define(['../../../uielements/panel', 'joshfire/class', 'joshfire/vendor/iscroll', 'joshfire/vendor/underscore'], function(Panel, Class, iScrollPlugin, _) {
  /**
  * @class Panel Android class
  * @name adapters_android_uielements_panel
  * @augments panel
  */
  return Class(Panel,
      /**
      * @lends uielements_panel.prototype
      */
      {
        type: 'Panel',

        /**
        * Get default options
        * @function
        * @return {Object} hash of options.
        */
        getDefaultOptions: function() {
          return _.extend(this.__super(), {
            scroller: false
          });
        },

        /**
        * Init scroll & subscribe to events
        * @param [scroller=false] {bool}: true if you want to make your panel scrollable using iScroll.
        * @param [scrollBarClass] {String}: Css class to be applied on the scrollbar.
        * @param [scrollOptions] {Object} hash of options, specific to iScroll.
        * @param [scrollOptions.hScroll], used to disable the horizontal scrolling no matter what. By default you can pan both horizontally and vertically, by setting this parameter to false you may prevent horizontal scroll even if contents exceed the wrapper.
        * @param [scrollOptions.vScroll], same as above for vertical scroll.
        * @param [scrollOptions.hScrollbar], set this to false to prevent the horizontal scrollbar to appear.
        * @param [scrollOptions.vScrollbar], same as above for vertical scrollbar.
        * @param [scrollOptions.fixedScrollbar], on iOS the scrollbar shrinks when you drag over the scroller boundaries. Setting this to true prevents the scrollbar to move outside the visible area (as per Android). Default: true on Android, false on iOS.
        * @param [scrollOptions.fadeScrollbar], set to false to have the scrollbars just disappear without the fade effect.
        * @param [scrollOptions.hideScrollbar], the scrollbars fade away when there's no user interaction. You may want to have them always visible. Default: true.
        * @param [scrollOptions.bounce], enable/disable bouncing outside of the boundaries. Default: true.
        * @param [scrollOptions.momentum], enable/disable inertia. Default: true. Useful if you want to save resources.
        * @param [scrollOptions.lockDirection], when you start dragging on one axis the other is locked and you can keep dragging only in two directions (up/down or left/right). You may remove the direction locking by setting this parameter to false.
        */
        init: function() {
          var self = this;
          self.__super();

          self.scrollOptions = _.extend({},self.options.scrollOptions, {active: self.options.scroller || false});
          if (self.options.scrollBarClass) {
            self.scrollOptions.scrollbarClass = self.options.scrollBarClass;
          }
        },

        insertScroller: function() {
          var self = this;

          if (!self.scrollOptions || !self.getState('inserted')) return;

          this.hasScroller = true;

          // compute the width of the inner elements and appy it to the container, to make the scroll works
          //$('.' + self.htmlId + '_scroller').width($('#' + self.htmlId + ' ul:first').width());

          if (self.scrollOptions.active) {
            if (self.iScroller) self.iScroller.destroy();
            self.iScroller = new iScroll(self.htmlId, self.scrollOptions);

            // until https://github.com/cubiq/iscroll/issues/90
            document.addEventListener('orientationChanged', function(e) {
              if (self.iScroller) self.iScroller.refresh();
            });
          }
        },

        /**
        * Insert panel in its parent element
        * @function
        * @param {UIElement | HTMLElement} parentElement
        * @param {Function} callback
        */
        insert: function(parentElement, callback) {
          var self = this;

          self.__super(parentElement, callback);

          if (self.scrollOptions.active) {
            document.addEventListener('touchmove', function(e) { e.preventDefault(); }, false);

            self.subscribe('afterShow', function() {
              self.insertScroller();
            });
          }
        },

      
        refresh: function(callback) {
          var self = this;

          if (self.scrollOptions.active) {
            setTimeout(function() {
              if (self.iScroller) {
                self.iScroller.refresh();
              }
            },0);
          }

          // Don't refresh if we have children
          if (!this.children.length) {
            return this.__super(callback);
          }
        }
      }
  );
});
