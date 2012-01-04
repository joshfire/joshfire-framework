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

Joshfire.define(['../../../uielements/list', 'joshfire/class', 'joshfire/vendor/underscore',  'joshfire/utils/grid'], function(List, Class, _, Grid) {
  /**
  * @class List implementation for Philips TV
  * @name adapters_philips_uielements_list
  * @augments uielements_list
  */
  return Class(List, 
    /**
    * @lends adapters_philips_uielements_list.prototype
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
      * Init list component
      * @function
      */
      init:function(){
        var self=this;
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
          //console.warn('data', self.data)
          self.setData(self.data);
          
           // Set the grid default position on first focus event
            self.subscribe('afterFocus', function(ev,data) {
              if (self.getState('focus') === undefined) {
                self.grid.goTo([0, 0]);
              }
            });
          
        self.subscribe('focusItem', function(ev, data) {
          self._applyFocus(data[0]);
        });

        self.subscribe('input', function(ev, data) {
          if (data.length == 2 && data[0] == 'enter') {
            if (data[1] == '__lastItem') {
              self.publish('lastItemSelect');
              return;
            }
            if (data[1] === undefined) return;
            self.selectById(data[1]);
          }
        });

        self.subscribe('beforeBlur', function(ev, data) {
          //$('#' + self.htmlId + ' .focused').removeClass('focused');
          if (!self.htmlEl) return false;
//          _.each(self.htmlEl.querySelectorAll('.focused'), function (child){
            _.each(self.htmlEl.getElementsByClassName('focused'), function (child){
            child.className = child.className.replace(/ focused/g,''); 
          });
          return true;
        });

        self.subscribe('select', function(ev, data) {
          var ids = data[0];
                    if (!self.htmlEl) return false;
          //$('#' + self.htmlId + ' .selected').removeClass('selected');
          //_.each(self.htmlEl.querySelectorAll('.selected'), function (child){
            _.each(self.htmlEl.getElementsByClassName('selected'), function (child){
            child.className = child.className.replace(/ selected/g,'');
          });

          for (var i = 0, l = ids.length; i < l; i++) {
            //$('#' + self.getItemHtmlId(ids[i])).addClass('selected');
/*            _.each(self.htmlEl.querySelectorAll('#'+self.getItemHtmlId(ids[i])), function (child){
              if (!(/ selected/.test(child.className))) child.className += ' selected';
            });*/
            var child = document.getElementById('#'+self.getItemHtmlId(ids[i]));
            if (!child) return false;
            if (!(/ selected/.test(child.className))) child.className += ' selected';
          }
           return true;
        });

      },
      /**
      * Insert list
      * @function
      * @param {UIElement | HTMLElement} parentElement
      * @param {Function} callback      
      */
      insert:function(parentElement, callback){
        this.__super(parentElement, callback);
      },
      /**
      * @ignore
      *
      */
      _applyFocus: function(id) {
        var self = this;
        if (!self.htmlEl) return false;
       // $('#' + self.htmlId + ' .focused').removeClass('focused');
//       _.each(self.htmlEl.querySelectorAll('.focused'), function (child){
         _.each(self.htmlEl.getElementsByClassName('focused'), function (child){
         child.className = child.className.replace(/ focused/g,'');
         
       });
        //$('#' + self.getItemHtmlId(id)).addClass('focused');
/*        _.each(self.htmlEl.querySelectorAll('#'+self.getItemHtmlId(id)), function (child){
          if (!(/ focused/.test(child.className))) child.className += ' focused';
        });*/
        var item = document.getElementById(self.getItemHtmlId(id));
        if (!/focused/.test(item.className)) item.className+=' focused';
        if (self.options.autoScroll) {
          // self.autoScroll();
        }
        return true;
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
          if (this.getState('focus') == id) return;

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
          if (data && data.length){
            this.grid.setGrid([data]);
          }
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
        }
      
  });
});
