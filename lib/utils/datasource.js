/*!
 * Joshfire Framework 0.9.1
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jul 20 19:23:09 2011
 */


/*!
* Joshfire Framework 0.9.1
* http://framework.joshfire.com/
*
* Copyright 2011, Joshfire
* Dual licensed under the GPL Version 2 and a Commercial license.
* http://framework.joshfire.com/license
*
* Date: Wed Jul 20 19:18:46 2011
*/


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


Joshfire.define(['joshfire/main', 'joshfire/class', 'joshfire/utils/pool', 'joshfire/vendor/underscore'], function(J, Class, Pool, _) {

  return Class(
      /**
      * @lends utils_datasource.prototype
      */
      {
        /**
        * @constructs
        * @class A Datasource implementation
        * @param {Object} options Options hash.
        */
        __constructor: function(options) {
          this.options = options || {};
          this.cache = {};

          this.pool = new Pool({
            'name': 'joshfire',
            //idleTimeoutMillis : 30000,
            //priorityRange : 3,
            'max': this.options.concurrency || 1,
            'create': function(callback) {
              callback();
            },
            'destroy': function() {}
          });

        },

        /**
        * @param args.cache {String}
        * @param args.url
        * @param args.dataType
        * @param args.data
        * @param args.type
        * @param args.username
        * @param args.password
        * @param args.success {function} will be called back when cached response has been retrieved.
        * @return {boolean}
        */
        testCache: function(args,callback) {
          //var hash = this.hash(args);
          //            console.warn("test cache",this.hash(args),args.cache,this.cache[hash],this.cache,args.cache*1000,(new Date()))
          if (args.cache) {
            var hash = this.hash(args);
            if (this.cache[hash] && (this.cache[hash].time + args.cache * 1000) > +(new Date())) {

              callback(null, JSON.parse(JSON.stringify(this.cache[hash].result)));
              return true;
            }
          }
          return false;
        },

        /**
        * @function
        * @param [args.cache=true] {boolean} set to false to disable automatic browser (or other interpreter) caching.
        * @param [args.data] {Object} provide a key/value pair object and it will append that to the URL if args.method is GET, or in the body of the query if args.method is POST.
        * @param [args.headers] {Object} Key/value pair with additional headers to add to the XHR.
        * @param [args.timeout] {Number} defines the timeout for this query.
        * @param [args.type] {String} POST, GET, HEAD, PUT, DELETE ...
        * @param [args.url] {String} the server URL.
        * @param callback {function} that function will be called after the query has been made. If the first argument !== null, there was an error.
        */
        request: function(args, callback) {
          var self = this;

          if (!this.testCache(args, callback)) {

            var params = _.extend({}, args);

            var cb = function(error, data) {
              self.pool.release();

              if (!callback) return;

              if (error) return callback(error);

              if (args.cache) {
                self.cache[self.hash(args)] = {
                  'result': JSON.parse(JSON.stringify(data)),
                  'time': +(new Date())
                };
              }
              callback(null, data);
            };

            var makeTheQuery = function() {
              //Been cached in the meantime?
              if (!self.testCache(args, callback)) {
                return self._request(params, cb);
              }
            };

            this.pool.acquire(makeTheQuery);

          }
        },

        /**
        * @private
        * @param {Object} params
        */
        _request: function(params, callback) {
          params.error('no backend included!');
        },

        /**
        * @private
        * use to generate a unique hash from the data
        * @param args.url
        * @param args.dataType
        * @param args.data
        * @param args.type
        * @param args.username
        * @param args.password
        * @return {string}
        */
        hash: function(args) {
          return JSON.stringify([args.url, args.dataType, args.data, args.type, args.username, args.password]);
        }

      });
});
