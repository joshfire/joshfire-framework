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
/**
 * @fileOverview Defines the global Joshfire.framework object exported by the
 * Joshfire framework.
 *
 * The file is a template file that cannot be used directly. It serves as basis
 * for the bootstrap file of each adapter in the framework.
 *
 * To generate the bootstrap files of the different adapters, run the command:
 *  node scripts/bootstraps.js
 *
 * On top of describing the selected adapter, its ancestors and the list of
 * adapted modules that these adapters define, the Joshfire.framework object
 * also sets the base path of the framework used to resolve dependencies in
 * "define" calls. When run client-side, that base path is determined from the
 * script tag that references the bootstrap script in the DOM.
 *
 * Please note that the main script set in the "data-main" attribute cannot be
 * everywhere. In particular:
 * - it must be targeted with a relative path
 * - it must not contain any "../" subpath.
 * These constraints are needed because the location of that script sets the
 * base path of the application for require.js, meaning the real base path used
 * to resolve dependencies. The constraints guarantee that this code can express
 * the path of the framework relative to the location of that main script.
 */

/*global Joshfire:true, module*/

(function() {
  var JF = {
    /**
     * @lends Joshfire
     */

    /**
     * The version of Joshfire
     * @type {Array}
     */
    version: [0, 9, 3],

    /**
     * DOM Ready util
     * @function
     * @param {Function} callback when finished.
     */
    onReady: function (callback) {
      if (callback) { callback(); }
    },

    /**
     * The current adapter.
     *
     * The <code>bootstraps</code> and <code>optimize</code>
     * <a href="/doc/develop/buildtools">build commands</a> set the property
     * to the appropriate value for each adapter.
     * @type {String}
     */
    adapter: JOSHFIRE_REPLACEME_ADAPTER_ID,

    /**
     * The list of adapters the current adapter depends on.
     *
     * The first item in the array is the parent adapter, the second the great
     * parent, and so on. The <a href="/doc/develop/buildtools">build commands</a>
     * use the "dependencies.json" file in each adapter's folder as value for
     * this property.
     * @type {Array}
     */
    adapterDeps: JOSHFIRE_REPLACEME_ADAPTER_DEPS,

    /**
     * List of modules supported by the current adapter and its dependencies.
     *
     * The <a href="/doc/develop/buildtools">build commands</a> compute that
     * value automatically from the list of JavaScript modules defined in each
     * adapter's folder.
     * @type {Object}
     */
    adapterModules: JOSHFIRE_REPLACEME_ADAPTER_MODULES,

    /**
     * Debug mode. Will console.log all events
     * @type {boolean}
     */
     debug: false,

    /**
     * Base framework path.
     *
     * The base path is automatically determined from the script tag that
     * references the framework in an HTML file. The code uses the value
     * that may have been set prior to running this code. The optimizer sets
     * the path to the right path beforehand in particular.
     */
    path: (Joshfire.framework || {}).path || ''
  };

  // Try to find the path we were included from.
  // If this fails author will have to set it manually.
  var reAdapter = new RegExp('^(.*)/adapters/' +
    JF.adapter + '/bootstrap\\.js$');
  var scripts = null;
  var match = null;
  var main = '';
  var depth = 0;
  var i = 0;
  var k = 0;
  var prefix = '';
  if (!JF.path && (typeof document !== 'undefined')) {
    scripts = document.getElementsByTagName('script');
    for (i = scripts.length - 1; i >= 0; i--) {
      match = reAdapter.exec(scripts[i].getAttribute('src'));
      if (match) {
        JF.path = match[1];
        if ((JF.path[0] !== '/') && (JF.path.indexOf('//') === -1)) {
          // Relative path. The base folder in require.js is determined
          // by the folder of the main script, which may be different
          // (see above for constraints on the location of data-main script)
          main = scripts[i].getAttribute('data-main');
          if (main) {
            depth = main.split('/').length - 1;
          }
          for (k = 0; k < depth; k++) {
            prefix += '../';
          }
          JF.path = prefix + JF.path;
        }
      }
    }
  }

  if (typeof require !== 'undefined' && require.config) {
    require.config({
      paths: {
        'joshfire-framework': JF.path
      },
      urlArgs: (Joshfire.debug? 'bust=' + (new Date()).getTime() : '')
    });
  }

  // Create the global Joshfire.framework object
  if (typeof Joshfire === 'undefined') {
    Joshfire = {};
  }
  Joshfire.framework = JF;

  // Attach the namespace to the global scope in node.js applications
  if ((typeof module !== 'undefined') && module.exports) {
    module.exports.JoshfireFramework = JF;
  }
}).call(this);
