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

(function() {
  var J;

  /**
  * @namespace The Joshfire namespace. The only global variable the framework should expose.
  * @name Joshfire
  */
  J = {
    /**
    * @lends Joshfire
    */

    /**
    * The version of Joshfire
    * @type {Array}
    */
    version: [0, 9, 1],

    /**
    * DOM Ready util
    * @function
    * @param {Function} callback when finished.
    */
    onReady: function(callback) {
      callback();
    },

    /**
    * The current adapter. Gets automatically populated by the <code>bootstraps</code>
    * or <code>optimize</code> <a href="/doc/develop/buildtools">build commands</a>
    * @type {String}
    */
    adapter: JOSHFIRE_REPLACEME_ADAPTER_ID,

    /**
    * List of modules supported by the current adapter and its dependencies. Gets automatically populated
    * by the <code>bootstraps</code> or <code>optimize</code> <a href="/doc/develop/buildtools">build commands</a>
    * @type {Object}
    */
    adapterModules: JOSHFIRE_REPLACEME_ADAPTER_MODULES,

    /**
    * List of adapters the current adapter depends on
    * @type {Array}
    */
    adapterDeps: [],

    /**
    * Debug mode. Will console.log all events
    * @type {boolean}
    */
    debug: false,


    basePath: 'joshfire/',

    requirePath: ''

  };

  // 'joshfire/uielements/list' => '[J.basePath]/adapters/DEVICE/uielements/list'
  var addAdapterToDeps = function(deps) {
    var src;

    //Lookup order is adapter, then its dependencies
    var adaptersLookup = [J.adapter].concat(J.adapterDeps);

    for (var i = 0, l = deps.length; i < l; i++) {

      //replace {adapter} by the current adapter
      deps[i] = deps[i].replace(/\{adapter\}/g, J.adapter);


      var noadapter = /^noadapter\!/.test(deps[i]);
      if (noadapter) {
        deps[i] = deps[i].substring(10);
      }



      if (/^joshfire\//.test(deps[i])) {

        var moduleName = deps[i].substring(9);

        deps[i] = J.basePath + moduleName;

        for (var ii = 0, ll = adaptersLookup.length; ii < ll && !noadapter; ii++) {
          var bFound = false;
          // If the adapter provides an implementation of this class, load it instead
          for (var iii = 0, iLength = J.adapterModules[adaptersLookup[ii]].length; iii < iLength; iii++) {
            if (J.adapterModules[adaptersLookup[ii]][iii] === moduleName) {
              deps[i] = deps[i].replace(moduleName, 'adapters/' + adaptersLookup[ii] + '/' + moduleName);
              bFound = true;
              break;
            }
          }
          if (bFound === true)
            break;
        }

      } else {
        deps[i] = J.requirePath + deps[i];
      }


    }

    return deps;
  };

  /**
  * Defines a module
  * @function
  * @param {Array} deps List of dependencies.
  * @param {Function} callback Callback when all the dependencies are loaded. Takes as arguments the list of loaded modules.
  * @name Joshfire.define
  */
  J.define = function(deps, callback) {
    define(addAdapterToDeps(deps), callback);
  };

  /**
  * Requires a list of modules
  * @function
  * @param {Array} deps List of modules to load.
  * @param {Function} callback Callback when all the modules are loaded. Takes as arguments the list of loaded modules.
  * @name Joshfire.require
  */
  J.require = function(deps, callback) {

    var requireOptions = {
      //"baseUrl":J.requirePath,
      /*"packages": [
      {
      "name":"joshfire",
      "location":J.basePath,
      "lib":"."
      }
      ]*/
    };

    if (J.debug && J.adapter != 'node') {
      requireOptions['urlArgs'] = 'bust=' + (new Date()).getTime();
    }

    require(requireOptions, addAdapterToDeps(deps), callback);
  };

  // Attach to global scope on browsers
  this.Joshfire = J;

  // Attach the namespace to the global scope or for nodeJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.Joshfire = J;
  }
})();
