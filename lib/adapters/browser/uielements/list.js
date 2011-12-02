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

Joshfire.define(['../../../uielements/list', 'joshfire/class', 'joshfire/utils/grid', 'joshfire/vendor/jquery', 'joshfire/vendor/underscore'], function(List, Class, Grid, $, _) {
  /**
  * @class List element for browsers
  * @name adapters_browser_uielements_list
  * @augments uielements_list
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
            moveOnFocus: false,
            noMouseAutoFocus: false,
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
            
            //console.warn("got focus",self.getState("focus"),self.path);
            if (self.getState('focus') === undefined) {
              self.grid.goTo([0, 0]);
              self.focusByIndex(0);
            } else {
              self.publish('focusItem', [self.getState('focus')]);
            }
          });

          self.subscribe('focusItem', function(ev, data) {
            self._applyFocus(data[0]);
            if (self.options.moveOnFocus) {
              self._moveDisplayZone(data[0]);

              //Disable keydown scroll button
              $(document).keydown(function(event) {
                if (event.keyCode == '40')
                  event.preventDefault();
              });
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
        * @ignore
        **/
        _moveDisplayZone: function(id) {
          var self = this,
              $elem = $('#' + self.getItemHtmlId(id)),
              rpos = $elem.offset().top - $(window).scrollTop();

          if ((rpos < 0) || ((rpos + $elem.outerHeight()) > $(window).height()))
            $('html, body').animate({ scrollTop: $elem.offset().top }, 200);
        },

        /**
        * Give focus to a specific item, using index
        * @function
        * @param {int} index
        */
        focusByIndex: function(index,forceRefocus) {
          this.focusById(this.data[index].id);
        },

        /**
        * Give focus to a specific item, using its id
        * @function
        * @param {int}
        */
        focusById: function(id,forceRefocus) {
          if (this.getState('focus') == id && !forceRefocus) return;

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
        _getItemHtml:function(idx){
          var tmpl = _.isFunction(this.options.itemTemplate) ? this.options.itemTemplate : _.template(this.options.itemTemplate);
          var tmplInner = _.isFunction(this.options.itemInnerTemplate) ? this.options.itemInnerTemplate : _.template(this.options.itemInnerTemplate);
          this.item=this.data[idx];
          this.itemInner = tmplInner(this);
          this.itemHtmlId = this.getItemHtmlId(this.item.id);
          
          return tmpl(this)
        },
        /**
        * @ignore
        */
        _getItemsHtml: function(itemFrom) {
          var ret = [];


          for (var i = itemFrom, l = this.data.length; i < l; i++) {
            ret.push(this._getItemHtml(i));
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
              if (liElements.slice(i, i + 1).attr('data-josh-grid-id') != this.data[i].id) {
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
          var selfJQuery = $(self.htmlEl)
          var focus = self.getState('focus') ? self.getState('focus') : self.data[0].id;



          var focusedIndex = self.grid.getCoordinatesById(focus)[0];
          //horizontal... pourquoi up/down et pas l'inverse ?
          if (self.options.orientation=='up' || self.options.orientation=='down'){
                      var list = selfJQuery.offset().left + selfJQuery.width();
            var focusedWidth = $('#' + self.getItemHtmlId(this.data[focusedIndex].id), self.htmlEl).width();
            
            for (var i = focusedIndex; i < self.data.length - 1; i++) {
              var elem = $('#' + self.getItemHtmlId(this.data[i].id), self.htmlEl).offset().left + focusedWidth;
              //focus to first element out of screen
              if (elem > list) break;
            }
            if (i != focusedIndex) {
              self.focusByIndex(i);
            }
            self.autoScroll();
            
          }
          //vertical
          else if (self.options.orientation=='left' || self.options.orientation=='right'){
                      var list = selfJQuery.offset().top + selfJQuery.height();
             var focusedHeight = $('#' + this.getItemHtmlId(this.data[focusedIndex].id), self.htmlEl).height();

              for (var i = focusedIndex; i < self.data.length - 1; i++) {
                var item=$('#' + self.getItemHtmlId(this.data[i].id), self.htmlEl);
                var elem = item.offset().top + item.height();
                //focus to first element out of screen
                if (elem > list) break;
              }
              if (i != focusedIndex) {
                self.focusByIndex(i);
                self.autoScroll();
              }
              else{
                if (!item){
                  console.warn('!item');
                  return false;
                }
                //overflow ! scroll down a little
                 moveObj = {top: 0-item.position().top-self.options.autoScrollOffset};
                  if (self.options.scrollAnimate) {
                    self.publish('scrollStart');
                    $('ul',self.htmlEl).stop().animate(moveObj, self.options.scrollAnimate, self.options.scrollEasing, function() {
                      self.publish('scrollEnd');
                    });
                  } else {
                    $('ul', self.htmlEl).stop().css(moveObj);
                  }
              }
              
          }
        },

        /**
        * Scroll to previous page
        * @function
        *
        */
        scrollToPrevPage: function() {
          var self = this;
          
          var property= self.options.orientation=='up' || self.options.orientation=='down' ? 'left' : 'top';
          
          var list = $('#' + self.htmlId).offset()[property];

          var focusedIndex = this.grid.getCoordinatesById(this.getState('focus'))[0];
          
          for (var i = focusedIndex+1; i > 0; i--) {
            var elem = $('#' + this.getItemHtmlId(this.data[i].id)).offset()[property];
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
            autoScrollOffsetDirection = this.options.autoScrollOffsetTop;
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
