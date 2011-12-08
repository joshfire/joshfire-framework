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

Joshfire.define(['../../../uielements/list', 'joshfire/class', 'joshfire/utils/grid', 'joshfire/vendor/underscore', 'joshfire/vendor/iscroll', 'joshfire/vendor/zepto'], function(List, Class,Grid, _, iScrollPlugin, $) {
  /**
  * @description Uses iScroll4, iScroll object is reachable via this.iScroller
  * @class List component for android adapter with native-like scrolling.
  * @name adapters_android_uielements_list
  * @augments uielements_list
  */
  return Class(List,
      /**
      * @lends adapters_android_uielements_list.prototype
      */
      {
        /**
        * Get default options
        * @function
        * @return {Object} hash of options.
        */
        getDefaultOptions: function() {
          return _.extend(this.__super(), {
            orientation: 'up',
            incrementalRefresh: false,
            itemTemplate: "<li id='<%=itemHtmlId%>' data-josh-ui-path='<%= path %>' data-josh-grid-id='<%= item.id %>' class='josh-" + this.type + " joshover'><%= itemInner %></li>",
            scroller: true

          });
        },
        /**
        * Init scroll & subscribe to events
        * @param [scroller=false] {bool}: true if you want to make your list scrollable using iScroll.
        * @param [scrollBarClass] {String}: Css class to be applied on the scrollbar.
        * @param [scrollOptions] {Object} hash of options, specific to iScroll.
        * @param [scrollOptions.hScroll], used to disable the horizontal scrolling no matter what. By default you can pan both horizontally and vertically, by setting this parameter to false you may prevent horizontal scroll even if contents exceed the wrapper.
        * @param [scrollOptions.vScroll], same as above for vertical scroll.
        * @param [scrollOptions.hScrollbar], set this to false to prevent the horizontal scrollbar to appear.
        * @param [scrollOptions.vScrollbar], same as above for vertical scrollbar.
        * @param [scrollOptions.fixedScrollbar], on iOS the scrollbar shrinks when you drag over the scroller boundaries. Setting this to true prevents the scrollbar to move outside the visible area (as per Android). Default: true on Android, false on iOS.
        * @param [scrollOptions.fadeScrollbar], set to false to have the scrollbars just disappear without the fade effect.
        * @param [scrollOptions.hideScrollbar], the scrollbars fade away when there’s no user interaction. You may want to have them always visible. Default: true.
        * @param [scrollOptions.bounce], enable/disable bouncing outside of the boundaries. Default: true.
        * @param [scrollOptions.momentum], enable/disable inertia. Default: true. Useful if you want to save resources.
        * @param [scrollOptions.lockDirection], when you start dragging on one axis the other is locked and you can keep dragging only in two directions (up/down or left/right). You may remove the direction locking by setting this parameter to false.
        *
        * @param [defaultSelection] {Array} : [&nbsp;].
        * @param [itemInnerTemplate] {String} : &lt;=item.label%&gt;.
        * @param [loadingTemplate=Loading...] {String}
        */
        init: function() {
          var self = this;
          self.__super();

          self.scrollOptions = _.extend({},self.options.scrollOptions, {active: self.options.scroller || false});
          if (self.options.scrollBarClass) {
            self.scrollOptions.scrollbarClass = self.options.scrollBarClass;
          }

          self.setData(self.data);

          self.subscribe('focusItem', function(ev, data) {
            self._applyFocus(data[0]);
          });

          self.subscribe('input', function(ev, data) {
            //if (data.length == 2 && data[0] == 'enter') {
            if (data.length >= 2 && data[0] == 'enter') {
              if (data[1] == '__lastItem') {
                self.publish('lastItemSelect');
                return;
              }
              if (data[1] === undefined) return;
              self.selectById(data[1]);
            }
          });

          self.subscribe('beforeBlur', function(ev, data) {
            $('#' + self.htmlId + ' .focused').removeClass('focused');
          });

          self.subscribe('select', function(ev, data) {
            var ids = data[0];

            $('#' + self.htmlId + ' .selected').removeClass('selected');

            for (var i = 0, l = ids.length; i < l; i++) {
              $('#' + self.getItemHtmlId(ids[i])).addClass('selected');
            }
          });

        },

        insertScroller: function() {
          var self = this;

          if (!self.scrollOptions || !self.getState("inserted")) return;

          this.hasScroller = true;

          // compute the width of the inner elements and appy it to the container, to make the scroll works
          //$('.' + self.htmlId + '_scroller').width($('#' + self.htmlId + ' ul:first').width());

          // Why did we need to unsubscribe ???
          //self.unsubscribe(subAfterShow);
          if (self.scrollOptions.active && self.data && self.data.length && self.htmlEl.children.length) {
            if (self.iScroller) self.iScroller.destroy();
            self.iScroller = new iScroll(self.htmlId, self.scrollOptions);

            // until https://github.com/cubiq/iscroll/issues/90
            document.addEventListener("orientationChanged", function(e) {
              if (self.iScroller) self.iScroller.refresh();
            }); 
          }

        },

        /**
        * Insert list in its parent element
        * @function
        * @param {UIElement | HTMLElement} parentElement
        * @param {Function} callback
        */
        insert: function(parentElement, callback) {
          var self = this;
          document.addEventListener('touchmove', function(e) { e.preventDefault(); }, false);

          self.__super(parentElement, callback);

          self.subscribe('afterShow', function() {
            self.insertScroller();
          });

        },
        /**
        * @ignore
        *
        */
        _applyFocus: function(id) {
          var self = this;

          $('#' + self.htmlId + ' .focused').removeClass('focused');
          $('#' + self.getItemHtmlId(id)).addClass('focused');

          if (self.options.autoScroll) {
            // self.autoScroll();
          }
        },

        /**
        * Give focus to a specific item, using its index
        * @function
        * param {int} index
        */
        focusByIndex: function(index) {
          this.focusById(this.data[index].id);
        },

        /**
        * Gives focus to a specific item
        * @function
        * param {int} id
        */
        focusById: function(id) {
          if (this.getState('focus') == id) return;

          this.setState('focus', id);
          this.publish('focusItem', [id]);

          this.focus();
        },


        /////////////////// RENDERING FUNCTIONS ///////////////////////////////
        //TODO make sure they're unique
        /**
        * @function
        * @param {int} itemId
        * @return {string}
        *
        */
        getItemHtmlId: function(itemId) {
          return this.getHtmlId() + '_' + itemId.toString().replace(/[^-A-Za-z0-9_:.]/, '-');
        },
        /**
        * Returns inner html, depending of the isLoading state
        * @function
        * @return {string} inner html.
        */
        getInnerHtml: function() {
          if (this.isLoading) {
            return this.template(this.options.loadingTemplate);
          } else {
            return '<div class="' + this.htmlId + '_scroller"><ul>' + this._getItemsHtml(0) + '</ul></div>';
            //style="width:1000%;"
          }
        },

        /**
        * @ignore
        *
        */
        _getItemsHtml: function(itemFrom) {
          var ret = [];

          var tmpl = _.isFunction(this.options.itemTemplate) ? this.options.itemTemplate : _.template(this.options.itemTemplate);

          var tmplInner = _.isFunction(this.options.itemInnerTemplate) ? this.options.itemInnerTemplate : _.template(this.options.itemInnerTemplate);

          if (!this.data) {
            return '';
          }

          for (var i = itemFrom, l = this.data.length; i < l; i++) {
            this.item = this.data[i];
            this.i = i;
            this.itemInner = tmplInner(this);
            this.itemHtmlId = this.getItemHtmlId(this.data[i].id);
            ret.push(tmpl(this));
          }

          if (this.options.lastItemInnerTemplate) {
            var tmplLastInner = _.isFunction(this.options.lastItemInnerTemplate) ? this.options.lastItemInnerTemplate : _.template(this.options.lastItemInnerTemplate);

            this.item = {'id': '__lastItem'};
            this.i = 'last';
            this.itemInner = tmplLastInner(this);
            this.itemHtmlId = this.getItemHtmlId('__lastItem');
            ret.push(tmpl(this));
          }

          return ret.join('');
        },

        //setLoading:function() {},

        /**
        * @function
        *
        */
        refresh: function() {
          var self = this;

          if (this.options.incrementalRefresh && $('#' + this.htmlId + ' ul').size()) {

            //Try to sync HTML and data incrementally
            var maxSyncedIndex = 0;
            var liElements = $('#' + this.htmlId + ' li');
            if (liElements.slice){
              for (var i = 0; i < this.data.length; i++) {
                if (liElements.slice(i, i + 1).attr('data-josh-grid-id') != this.data[i].id) {
                  maxSyncedIndex = i;
                  break;
                }
                liElements.slice(maxSyncedIndex).remove();
              }
            }
            $('#' + this.htmlId + ' ul').append(this._getItemsHtml(maxSyncedIndex));
            this.publish('afterRefresh');

          } else {
            if (self.iScroller) {
              self.iScroller.destroy();
              self.iScroller = null;
            }
            this.__super();
            this.insertScroller();
          }

          setTimeout(function() {
            if (self.iScroller) self.iScroller.refresh();
          },0);


          var focus = this.getState('focus');
          if (focus) {
            this._applyFocus(focus);
          }
        },

        setLoading: function(isLoading) {

          if (this.iScroller && isLoading) {
            this.iScroller.destroy();
            this.iScroller = null;
          }
          this.__super(isLoading);

        }


      });
});
