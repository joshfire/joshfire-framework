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

Joshfire.define(['joshfire/uielements/panel', 'joshfire/class', 'joshfire/vendor/underscore'], function(Panel, Class, _) {
  /**
  * Panel Manager shows one of its children panel at a time<br />
  * The manager listens to a uiMaster, and change its active view depending of the select events fired by this master
  * @class Panel Manager base class
  * @name uielements_panel.manager
  * @augments uielements_panel
  */
  return Class(Panel,
      /**
      * @lends uielements_panel.manager.prototype
      */
      {
        /**
        * Initialize the panel manager<br />
        * If uiMaster, subscribe to masters' select event
        * @function
        *
        **/
        init: function() {
          var self = this;

          self.lastSequenceId = 0;

          self.subscribe('state', function(ev, data) {
            if (data[0] == 'route') {
              self.route(data[1]);
            }
          });

          self.currentId = false;

        },

        switchTo: function(finalPath) {
          var self = this;

          self.currentPanelId = finalPath;

          //Show panel.mgr item referenced by uimaster
          //Hide everybody else
          _.each(self.children, function(child) {
            if (child.path == self.path + '/' + finalPath) {
              self.app.ui.element(child.path).show();
            } else {
              self.app.ui.element(child.path).hide();
            }
          });
        },

        setup: function(callback) {
          var self = this;

          if (self.options.uiMaster) {
            self.app.ui.fetch(self.options.uiMaster, false, function(error, item) {
              var uiMaster = self.app.ui.element(self.options.uiMaster);

              uiMaster.subscribe('select', function(ev, data) {
                //Check target exists
                if (!data.length || self.app.ui.get(self.path + '/' + data[0][0]) === undefined) {
                  return false;
                }

                self.switchTo(data[0][0]);

                return true;
              });
            });
          }

          callback();
        },

        /**
        * Init view
        * @function
        * @param {string} view
        * @param {Function} callback, called after init.
        **/
        initView: function(view, callback) {
          var self = this;

          if (_.isString(view)) {
            //todo cache view classes
            Joshfire.require([this.options.requirePrefix + view], function(viewClass) {
              if (!viewClass) {
                return callback('no such view');
              }
              var elt = new viewClass(self.app, self.path + '/' + view, {
                sequenceId: self.lastSequenceId++
              });
              return callback(null, elt);
            });
          }
        }
      });
});
