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

Joshfire.define(['joshfire/class', '../../app', 'joshfire/vendor/underscore'], function(Class, App, _) {

  /**
  * @class App implementation for Node.js
  * @name adapters_node_app
  * @augments app
  */
  return Class(App,
      /**
      * @lends adapters_node_app.prototype
      */
      {

        init: function() {
          this.httpHeaders = {
            'Content-Type': 'text/html'
          };
          this.httpStatus = 200;
        },

        setHttpHeader: function(header,content) {
          this.httpHeaders[header] = content;
        },
        setHttpStatus: function(code) {
          this.httpStatus = code;
        },

        render: function(callback) {
          var self = this;

          this.insert(function() {

            self.ui.element('').getFreshHtml(function(err,html) {

              callback(null, self.httpStatus, self.httpHeaders, html);

            });

          });




        },


        /**
        * Inserts the app in the DOM
        * @function
        */
        insert: function(callback) {
          var self = this;

          if (!callback) callback = function() {};

          this.publish('beforeInsert', [], true);

          var rootElement = this.ui.element('');
          rootElement.insert(null, function(err) {
            if (err) return callback(err);

            self.publish('afterInsert');
            callback();
          });



        }
      });

});
