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

Joshfire.define(['joshfire/main', 'joshfire/class', 'joshfire/tree.ui', 'joshfire/tree.data', 'joshfire/mixins/pubsub', 'joshfire/mixins/state', 'joshfire/vendor/underscore'], function(J, Class, UITree, DataTree, PubSub, State, _) {
  var App = Class(
      /**
      * @lends app.prototype
      */
      {
        /**
        * The id of the application
        * @type {string}
        * @fieldOf app.prototype
        */
        id: 'DefaultAppId',

        /**
        * Gets default options. Override it in your app class to provide different defaults
        * @methodOf app.prototype
        * @return {Object} Hash of default options.
        */
        getDefaultOptions: function() {
          return {
            autoSetup: true,
            uiTree: false,
            inputs: [],
            dataTree: false,
            autoInsert: false
          };
        },

        /**
        * @constructs
        * @borrows mixins_pubsub#publish as #publish
        * @borrows mixins_pubsub#subscribe as #subscribe
        * @borrows mixins_pubsub#unsubscribe as #unsubscribe
        * @borrows mixins_state#setState as #setState
        * @borrows mixins_state#setStates as #setStates
        * @borrows mixins_state#getState as #getState
        * @borrows mixins_state#onState as #onState
        * @borrows mixins_state#deleteState as #deleteState
        * @class The base Application class
        * @param {Object} options Options for the app.
        */
        __constructor: function(options) {

          this.options = _.extend(this.getDefaultOptions(), options || {});

          this.init();

          if (this.options.autoSetup) {
            this.setupAll(function(err) {});
          }
        },

        /**
        * Overriden in adapters
        * @private
        */
        init: function() {

        },

        /**
        * Performs further setup of the app. Override it in your app class
        * @methodOf app.prototype
        * @param {Function} callback when finished.
        */
        setup: function(callback) {
          callback();
        },

        /**
        * Performs setup of core components : Data tree, UI tree, Inputs, then calls setup()
        * Fires either an "error" event or a "ready" event.
        * @methodOf app.prototype
        * @param {Function} callback when finished.
        */
        setupAll: function(callback) {
          var self = this;
          var err = function(error) {
            self.publish('error', [error]);
            callback(error);
          };

          self.setupDataTree(function(error) {
            if (error) return err(error);

            self.setupUiTree(function(error) {
              if (error) return err(error);

              self.setupInputs(function(error) {
                if (error) return err(error);

                self.setup(function(error) {
                  if (error) return err(error);

                  self.publish('ready');
                  callback(null, true);

                });
              });
            });
          });
        },

        /**
        * Setups the UI Tree
        * @methodOf app.prototype
        * @param {Function} callback when finished.
        */
        setupUiTree: function(callback) {
          if (this.options.uiTree || this.uiTree) {
            this.ui = new UITree(this, 'ui', {
              'tree': this.options.uiTree || this.uiTree
            });
            this.ui.setup(callback);
          } else if (this.options.uiClass || this.uiClass) {
            this.ui = new (this.options.uiClass || this.uiClass)(this, 'ui');
            this.ui.setup(callback);
          } else {
            callback(null);
          }

        },

        /**
        * Setups the Data Tree
        * @methodOf app.prototype
        * @param {Function} callback when finished.
        */
        setupDataTree: function(callback) {
          if (this.options.dataTree || this.dataTree) {
            this.data = new DataTree(this, 'data', {
              'tree': this.options.dataTree || this.dataTree
            });
            this.data.setup(callback);
          } else if (this.options.dataClass || this.dataClass) {
            this.data = new (this.options.dataClass || this.dataClass)(this, 'data');
            this.data.setup(callback);
          } else {
            callback(null);
          }
        },

        /**
        * Setups the Inputs as defined in app.options.inputs
        * @methodOf app.prototype
        * @param {Function} callback when finished.
        */
        setupInputs: function(callback) {
          var self = this;

          if (self.options.inputs.length === 0) {
            return callback(null);
          }
          var done = _.after(self.options.inputs.length, function() {
            callback(null);
          });

          self.inputs = {};
          _.each(self.options.inputs, function(input) {

            var init = function(Input) {
              self.inputs[input] = new Input(self, input);
              self.inputs[input].setup(done);
            };
            if (_.isString(input)) {
              J.require(['joshfire/inputs/' + input], init);
            } else {
              init(input);
            }

          });
        }
      });

  PubSub.mixin(App.prototype);
  State.mixin(App.prototype);

  return App;
});
