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

  J.adapterDeps = ['browser'];



})(Joshfire);
