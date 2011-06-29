/*!
 * Joshfire Framework 0.9.0
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jun 29 16:25:37 2011
 */


Joshfire.define(['../../../uielements/list', 'joshfire/class', 'joshfire/utils/grid', 'joshfire/vendor/jquery', 'joshfire/vendor/underscore'], function(List, Class, Grid, $, _) {
  /**
  * @class
  * @name adapters_browser_uielements_list
  * @extends {uielements_list}
  */
  return Class(List,
      /**
      * @lends adapters_browser_uielements_list.prototype
      */
      {
        /**
        * Default options, itemTemplate, scroll options
        * @function
        * @return {Object} hash of options.
        */
        getDefaultOptions: function() {
          return _.extend(this.__super(), {
            orientation: 'up',
            autoScroll: false,
            autoScrollMargin: 200,
            autoScrollMarginLeft: 0,
            autoScrollMarginRight: 0,
            autoScrollOffset: 300,
            autoScrollOffsetLeft: 0,
            autoScrollOffsetRight: 0,
            scrollAnimate: 200,
            scrollEasing: 'swing',
            incrementalRefresh: false,
            itemTemplate: "<li id='<%=itemHtmlId%>' data-josh-ui-path='<%= path %>' data-josh-grid-id='<%= item.id %>' class='josh-" + this.type + " joshover'><%= itemInner %></li>"
          });
        },

        /**
        * Init grid & subscribe to events
        * @function
        *
        */
        init: function() {
          var self = this;


          self.grid = new Grid({
            'grid': [
              []
            ],
            //defaultPosition:[0,0],
            inputSource: this,
            onChange: function(coords, elem) {
              console.log('onChange', self.path, coords, elem);
              self.focusById(elem.id);
            },
            onExit: function(move, absMove) {
              //go to leaf
              //console.log("onExit", side);
              if (self.options.beforeGridExit) {
                if (!self.options.beforeGridExit(self, move, absMove)) {
                  return false;
                }
              }

              //todo make this pluggable
              if (absMove == 'down') {
                self.app.ui.move('focus', 'down');


              //go to parent
              } else if (absMove == 'up') {
                if (self.dataPath == '/') return false;

                self.app.ui.move('focus', 'up');

              }
              return true;
            },
            onValidate: function(coords, elem) {
              self.selectById(elem.id);
            },
            orientation: this.options.orientation
          });

          self.__super();

          self.setData(self.data);

          // Set the grid default position on first focus event
          self.subscribe('afterFocus', function(ev,data) {
            //console.log("got focus",self.getState("focus"),self.path);
            if (self.getState('focus') === undefined) {
              self.grid.goTo([0, 0]);
            }
          });

          self.subscribe('focusItem', function(ev, data) {
            self._applyFocus(data[0]);
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
        /**
        * @ignore
        **/
        _applyFocus: function(id) {
          var self = this;

          $('#' + self.htmlId + ' .focused').removeClass('focused');
          $('#' + self.getItemHtmlId(id)).addClass('focused');

          if (self.options.autoScroll) {
            self.autoScroll();
          }
        },

        /**
        * Give focus to a specific item, using index
        * @function
        * @param {int} index
        */
        focusByIndex: function(index) {
          this.focusById(this.data[index].id);
        },

        /**
        * Give focus to a specific item, using its id
        * @function
        * @param {int}
        */
        focusById: function(id) {
          if (this.focus == id) return;

          this.setState('focus', id);
          this.publish('focusItem', [id]);

          this.focus();
        },

        /**
        * @function
        * @param {Array} data
        */
        setData: function(data) {
          this.__super(data);
          this.grid.setGrid([data]);
        },
        /**
        * @function
        * @param {int} id
        * @return {Object}
        */

        getDataById: function(id) {
          var coords = this.grid.getCoordinatesById(id);
          if (coords) {
            return this.data[coords[0]];
          }
          return null;
        },


        /////////////////// RENDERING FUNCTIONS ///////////////////////////////
        //TODO make sure they're unique
        /**
        * @function
        * @param {int} itemId
        * @return {string}
        */
        getItemHtmlId: function(itemId) {
          return this.getHtmlId() + '_' + itemId.toString().replace(/[^-A-Za-z0-9_:.]/, '-');
        },

        /**
        * @function
        * @return {string} html.
        */
        getInnerHtml: function() {
          if (this.isLoading) {
            return this.template(this.options.loadingTemplate);
          } else {
            return '<ul>' + this._getItemsHtml(0) + '</ul>';
          }
        },

        /**
        * @ignore
        */
        _getItemsHtml: function(itemFrom) {
          var ret = [];

          var tmpl = _.isFunction(this.options.itemTemplate) ? this.options.itemTemplate : _.template(this.options.itemTemplate);
          var tmplInner = _.isFunction(this.options.itemInnerTemplate) ? this.options.itemInnerTemplate : _.template(this.options.itemInnerTemplate);

          for (var i = itemFrom, l = this.data.length; i < l; i++) {
            this.item = this.data[i];
            this.i = i;
            this.itemInner = tmplInner(this);
            this.itemHtmlId = this.getItemHtmlId(this.data[i].id);
            ret.push(tmpl(this));
          }

          return ret.join('');
        },

        /**
        * @function
        *
        */
        refresh: function() {

          if (this.options.incrementalRefresh && $('#' + this.htmlId + ' ul').size()) {

            //Try to sync HTML and data incrementally
            var maxSyncedIndex = 0;
            var liElements = $('#' + this.htmlId + ' li');
            for (var i = 0; i < this.data.length; i++) {
              if (liElements.slice(i, i + 1).attr('josh-grid-id') != this.data[i].id) {
                maxSyncedIndex = i;
                break;
              }
            }
            liElements.slice(maxSyncedIndex).remove();

            $('#' + this.htmlId + ' ul').append(this._getItemsHtml(maxSyncedIndex));

            this.publish('afterRefresh');

          } else {
            this.__super();
          }

          var focus = this.getState('focus');
          if (focus) {
            this._applyFocus(focus);
          }

        },





        /////////////// SCROLL FUNCTIONS //////////////////
        /**
        * scroll to next page
        * @function
        *
        *
        */
        scrollToNextPage: function() {
          var self = this;

          var list = $('#' + self.htmlId).offset().left + $('#' + self.htmlId).width();

          var focusedIndex = this.grid.getCoordinatesById(this.getState('focus'))[0];

          var focusedWidth = $('#' + this.getItemHtmlId(this.data[focusedIndex].id)).width();

          for (var i = focusedIndex; i < self.data.length - 1; i++) {

            var elem = $('#' + this.getItemHtmlId(this.data[i].id)).offset().left + focusedWidth;

            //focus to first element out of screen
            if (elem > list) break;
          }

          if (i != focusedIndex) {
            self.focusByIndex(i);
          }

          self.autoScroll();

        },

        /**
        * Scroll to previous page
        * @function
        *
        */
        scrollToPrevPage: function() {
          var self = this;

          var list = $('#' + self.htmlId).offset().left;

          var focusedIndex = this.grid.getCoordinatesById(this.getState('focus'))[0];

          for (var i = focusedIndex; i > 0; i--) {
            var elem = $('#' + this.getItemHtmlId(this.data[i].id)).offset().left;

            //focus to first element out of screen
            if (elem < list) break;

          }

          if (i != focusedIndex) {
            self.focusByIndex(i);
          }

          self.autoScroll();
        },

        /**
        * autoscrolling
        * @function
        *
        */
        autoScroll: function() {

          var focused = this.grid.getCoordinatesById(this.getState('focus'));

          if (!focused) return;

          var focusedIndex = focused[0];

          var elt = $('#' + this.getItemHtmlId(this.data[focusedIndex].id));
          var list = $('#' + this.htmlId);
          var ul = $('#' + this.htmlId + ' ul');

          if (!elt.length || !list) return;

          var safetyMargin = 100;
          var animate = this.options.scrollAnimate;
          var totalPixels, movingProperty, eltPixelsToStart;

          if (this.options.orientation == 'up' || this.options.orientation == 'down') {
            totalPixels = $(list).width();
            movingProperty = 'left';
            eltPixelsToStart = [elt.position().left, elt.position().left + elt.width()];


          } else {
            totalPixels = $(list).height();
            movingProperty = 'top';
            eltPixelsToStart = [elt.position().top, elt.position().top + elt.height()];
          }
          //TODO store the target offset elsewhere (when moving, we don't care about intermediate values)
          var currentOffset = parseInt(ul.css(movingProperty), 10);

          var newOffset = currentOffset;

          if (eltPixelsToStart[1] + currentOffset + (this.options.autoScrollMarginRight || this.options.autoScrollMargin) > totalPixels) {
            newOffset = -eltPixelsToStart[0] + (this.options.autoScrollOffsetLeft || this.options.autoScrollOffsetLeft);
          } else if (eltPixelsToStart[0] + currentOffset - (this.options.autoScrollMarginLeft || this.options.autoScrollMargin) < 0) {
            newOffset = totalPixels - eltPixelsToStart[1] - (this.options.autoScrollOffsetRight || this.options.autoScrollOffset);
          }

          //console.log("autoScroll",eltPixelsToStart,totalPixels,currentOffset,newOffset);
          newOffset = Math.min(0, newOffset);

          if (newOffset != currentOffset) {
            var moveObj = {};
            moveObj[movingProperty] = newOffset + 'px';
            if (animate) {
              var self = this;
              self.publish('scrollStart');
              ul.stop().animate(moveObj, animate, this.options.scrollEasing, function() {
                self.publish('scrollEnd');
              });
            } else {
              ul.stop().css(moveObj);
            }
          }
        }
      });
});
