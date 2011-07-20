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

Joshfire.define(['joshfire/class', 'joshfire/vendor/underscore'], function(Class, _) {


  return Class(
      /**
      * @lends adapters_node_app.factory.prototype
      */
      {

        /**
        * @constructs
        * @class App factory for Node.js mostly to serve requests
        */
        __constructor: function(factoryOptions, appClass, appOptions) {

          this.options = factoryOptions || {};
          this.appClass = appClass;

          this.appOptions = appOptions || {};
          this.appOptions.autoSetup = false;

        },


        getDataTree: function(callback) {

          //Todo persist one data tree instance accross apps
        },

        buildInstance: function(states, callback) {

          var app = new this.appClass(this.appOptions);

          app.setupAll(function(err) {
            if (err) {
              return callback(err, app);
            }

            app.setStates(states);

            //Callbacks from the router should be executed synchronously.
            var routed = app.getState('routed');

            if (routed) {
              callback(null, app);
            } else {
              callback('no route', app);
            }

          });

        }
      });

});
