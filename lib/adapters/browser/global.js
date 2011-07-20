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

(function(J) {

  //todo !joshfire
  J.onReady = function(f) {
    J.require(['joshfire/vendor/jquery'], function($) {
      $(f);
    });
  };

  /* Protect against forgotten console.logs */
  if (window && typeof window.console === 'undefined') {
  window.console = {
  'log': function() {},
  'message': function() {},
  'warn': function() {},
  'error': function() {},
  'info': function() {},
  'table': function() {},
  'trace': function() {},
  'debug': function() {},
  'profile': function() {},
  'exception': function() {},
  'time': function() {}
  };
  }
  
  /* THE HTML5 shim, taken from http://code.google.com/p/html5shim/source/browse/trunk/html5-els.js
  * with that, IE can apply styles to the HTML5 elements
  */
  /*@cc_on'abbr article aside audio canvas details figcaption figure footer header hgroup mark meter nav output progress section summary time video'.replace(/\w+/g,function(n){document.createElement(n)})@*/
  
  })(Joshfire);
