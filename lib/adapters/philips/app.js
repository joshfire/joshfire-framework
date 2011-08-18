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

Joshfire.define(['joshfire/class', '../../app', 'joshfire/main', 'joshfire/vendor/underscore',  'joshfire/inputs/remote'], function(Class, App, J, _, Remote) {

  Joshfire.getScript = function() {/*not implemented*/};


  return Class(App,
      /**
      * @lends adapters_ios_app.prototype
      */
      {
        getDefaultOptions: function() {
          return _.extend(this.__super(), {
            inputs: [Remote],
            autoInsert: true,
            parentElement: document.body
          });
        },

        /**
        * @class App implementation for iOS
        * @constructs
        * @augments app
        */
        __constructor: function(options) {
          var self = this;
          this.options = _.extend(this.getDefaultOptions(), options || {});

          if (self.options.autoInsert) {
            self.subscribe('ready', function() {
              J.onReady(function() {
                self.insert(self.options.parentElement);
              });
            });
          }

          this.__super(options);

        },

        /**
        * Inserts the app in the DOM
        * @function
        */
        insert: function(htmlId) {
          var self = this;

          if (_.isString(htmlId)) {
            this.baseHtmlEl = document.getElementById(htmlId);
          } else {
            this.baseHtmlEl = htmlId;
          }

          this.publish('beforeInsert', [this.baseHtmlEl], true);

          var rootElement = this.ui.element('');
          rootElement.insert(this.baseHtmlEl);

          this.publish('afterInsert');

        }
      });

});
