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

Joshfire.define(['joshfire/main', 'joshfire/class', 'joshfire/tree', 'joshfire/vendor/underscore', 'joshfire/uielements/panel'], function(J, Class, Tree, _, Panel) {


  /**
  * @class UI Tree base class
  * @name tree.ui
  * @augments tree
  */
  return Class(Tree,
      /**
      * @lends tree.ui.prototype
      *
      */
      {

        allowRootAccess: true,

        //List of elements pending setup
        setupQueue: [],

        /**
        * @override
        * @inheritDoc
        */
        formatItem: function(path, data, callback) {
          var self = this;

          this.setupQueue.push(path);

          if (_.isString(data.type)) {
            //todo !joshfire
            J.require(['joshfire/uielements/' + data.type], function(eltClass) {
              data.element = new eltClass(self.app, path, data);
              callback(null, data);
            });
          } else {
            data.element = new data.type(self.app, path, data);
            callback(null, data);
          }
        },


        setup: function(callback) {
          var self = this;

          self.__super(function() {
            self.setupElements(callback);
          });
        },

        // Processes the setup Queue.
        setupElements: function(callback) {
          var self = this;

          var next = function() {
            if (!self.setupQueue.length) return callback();
            var path = self.setupQueue.shift();
            self.element(path).setup(next);
          }
          next();

        },

        /**
        * @private
        */
        addRootElement: function(callback) {

          //Set the first container panel
          this.set('', {
            'id': 'root',
            'type': 'panel',
            'autoShow': true
          }, callback);

        },

        /**
        * @private
        */
        init: function() {

          var self = this;

          this.__super();

          //Manage focus to only one UI Element
          self.lastFocusedPath = null;

          self.subscribe('state', function(ev, data) {
            var register = data[0];
            var path = data[1];

            if (register == 'focus') {
              var elt = self.element(path);
              //console.log('focusing', path, self.lastFocusedPath);
              if (path != self.lastFocusedPath) {
                if (self.lastFocusedPath) {
                  self.element(self.lastFocusedPath).blur();
                }

                elt.focus();
                self.lastFocusedPath = path;
              }

            }
          });

          // Forward global events to the UI Element that has focus
          self.app.subscribe('input', function(ev, data) {
            if (self.lastFocusedPath) {
              self.element(self.lastFocusedPath).publish(ev, data);
            }
          });



        },

        /**
        * @override
        * @inheritDoc
        */
        set: function(path, data, callback) {
          var self = this;

          //only at first set of root level
          if (path == '/' && !this.tree[''] && !this.tree['/']) {

            // buildTree() returned an array, add a root element automatically
            if (_.isArray(data)) {
              this.addRootElement(function(err) {
                self.set(path, data, callback);
              });
              return true;

            // buildTree() returned a root element, fix the path
            } else {
              path = '';
            }
          }
          return this.__super(path, data, callback);
        },

        /**
        * Gets an element instance
        * @function
        * @param {string} path Path in the tree.
        * @return {uielement | false} UI Element instance.
        */
        element: function(path) {
          var tmp = this.get(path);
          if (!tmp) {
            console.error('Error retrieving ui element', path);
            return false;
          }
          return tmp.element;
        }

      });


});
