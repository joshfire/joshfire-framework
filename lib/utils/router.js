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
      * @lends utils_router.prototype
      */
      {

        /**
        * @constructs
        * @class A routing class
        * @param {app} app Reference to the app instance.
        * @param {Array} routes An array of routes. The first one that matches will be used.
        * @param {Object} options Options hash.
        */
        __constructor: function(app,routes,options) {
          var self = this;

          this.options = _.extend({
            //default manager is the app itself
            manager: app
          }, options);

          this.app = app;
          this.routes = [];

          if (routes) {
            this.set(routes);
          }

          this.subscribeToUriChanges();
        },

        subscribeToUriChanges: function() {
          var self = this;

          this.app.subscribe('state', function(ev,data) {
            if (data[0] == 'uri') {
              var r = self.route(data[1]);
              if (r) {
                self.options.manager.setState('route', r);
              }
              self.app.setState('routed', !!r);
            }
          });
        },

        add: function(route) {
          if (_.isString(route[0])) {
            this.routes.push({
              'regexp': new RegExp('^(\.?)' + route[0].replace(/:([\w\d]+)/g, '([^\/]*)').replace(/\*([\w\d]+)/g, '(.*?)') + '$'),
              'paramNames': _.map(route[0].match(/(\:|\*)([\w\d]+)/g), function(name) { return name.substring(1); }),
              'target': route[1]
            });
          }
        },

        set: function(routes) {
          this.routes = [];
          for (var i = 0, l = routes.length; i < l; i++) {
            this.add(routes[i]);
          }
        },

        route: function(uri) {
          for (var i = 0, l = this.routes.length; i < l; i++) {
            var match = uri.match(this.routes[i].regexp);
            //console.log("match",uri,this.routes[i].regexp,match,args,this.routes[i].argNames);
            if (match) {
              var args = {};
              for (var y = 2, m = match.length; y < m; y++) {
                args[this.routes[i].paramNames[y - 2]] = match[y];
              }
              return {
                'params': args,
                'query': this.app.getState('query'),
                'body': this.app.getState('body'),
                'headers': this.app.getState('headers'),
                'target': this.routes[i].target
              };
            }
          }
          return false;
        }
      });
});
