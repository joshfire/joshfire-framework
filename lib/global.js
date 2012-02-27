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
  var JF;

  if (typeof Joshfire == "undefined") {
    Joshfire = {};
  }

  /**
  * @namespace The Joshfire namespace. The only global variable the framework should expose.
  * @name Joshfire
  */
  JF = {
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
    adapterDeps: JOSHFIRE_REPLACEME_ADAPTER_DEPS,

    /**
    * Debug mode. Will console.log all events
    * @type {boolean}
    */
    debug: false,

    path:(Joshfire.framework||{}).path||"joshfire"
  };

  //Try to find the path we were included from. If this fails author will have to 
  //set it manually.
  if (typeof document!="undefined") {
    var scripts = document.getElementsByTagName("script"),
      m,
      adapterMatch = new RegExp("^(.*)\/adapters\/"+JF.adapter+"\/bootstrap\.js$");

    for (var i=scripts.length-1;i>=0;i--) {
      m = adapterMatch.exec(scripts[i].getAttribute("src"));
      if (m) {
        JF.path=m[1];
      }
    }
  }
  
  if (typeof require!="undefined" && require.config) {
    require.config({
      paths: {
          "joshfire-framework": JF.path
      },
      urlArgs: (Joshfire.debug?"bust=" +(new Date()).getTime():"")
    });
  }
  

  
  // Attach to global scope on browsers
  Joshfire.framework = JF;

  // Attach the namespace to the global scope or for nodeJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.JoshfireFramework = JF;
  }
}).call(this);
