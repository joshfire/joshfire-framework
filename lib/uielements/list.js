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

Joshfire.define(['joshfire/uielement', 'joshfire/class', 'joshfire/vendor/underscore'], function(UIElement, Class, _) {
  /**
  * @class List base class
  * @name uielements_list
  * @augments uielement
  */
  return Class(UIElement,
      /**
      * @lends uielements_list.prototype
      */
      {
        type: 'List',
        data: [],

        /**
        * Default options:<br /><ul>
        *   <li>defaultSelection {Array}: [&nbsp;]</li>
        *   <li>itemInnerTemplate {String}: &lt;=item.label%&gt;</li>
        *   <li>loadingTemplate {String}: 'Loading...'</li>
        * </ul>
        * @function
        * @return {Object} hash of options.
        */
        getDefaultOptions: function() {
          return _.extend(this.__super(), {
            'persistSelection': true,
            'defaultSelection': [],
            'multiple': false,
            'itemTemplate': '<%= itemInner %>',
            'itemInnerTemplate': '<%= item.label %>',
            'loadingTemplate': 'Loading...'
          });
        },

        /**
        * Init data and set default selection
        * @function
        */
        init: function() {
          this.setData(this.options.data || []);

          //Don't send a select event at startup
          this.setState('selection', this.options.defaultSelection);
        },
       

        /**
        * Sets the tree root associated with the element
        * @function
        * @param {String} dataPath Tree path.
        */
        setDataPath: function(dataPath) {

          //Make sure we bind to a directory
          if (!dataPath.match(/\/$/)) {
            dataPath = dataPath + '/';
          }

          this.__super(dataPath);
        },

        /**
        * Reset selection (with an id)
        * @function
        */
        resetSelection: function() {
          this.selectById(this.options.defaultSelection);
        },

        /**
        * Select item(s) using its/theirs index(es)
        * @function
        * @param {array} indexes
        */
        selectByIndex: function(indexes) {
          //console.warn('select by index', indexes)
          if (!_.isArray(indexes)) {
            indexes = [indexes];
          }
          var ids = [];
          for (var i = 0, l = indexes.length; i < l; i++) {
            ids[i] = this.data[indexes[i]].id;
          }
          this.selectById(ids);
        },

        /**
        * Select a item using its id. Called by selectByIndex
        * @function
        * @param {array} ids
        */
        selectById: function(ids) {
          //console.warn('selct by id', ids)
          var self = this;

          if (!_.isArray(ids)) {
            ids = [ids];
          }

          if (_.isEqual(this.selection, ids)) return;

          this.setState('selection', ids);
          this.publish('select', [ids]);
          this.app.data.publish('select', [_.map(ids, function(id) {
            return self.dataPath + id;
          })]);
        },
        /**
        * The name tells it all
        * @function
        * @param {int} id
        * return {Object}.
        */
        getDataById: function(id) {
          for (var i = 0, l = this.data.length; i < l; i++) {
            if (this.data[i].id == id) {
              return this.data[i];
            }
          }
          return null;
        }
      }
  );
});
