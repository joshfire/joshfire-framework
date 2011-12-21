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

Joshfire.define(['joshfire/class'], function(Class) {

  return Class( /** @lends input */ {

    /**
    * @class Abstract class for inputs
    * @constructs
    * @param {app} app Reference to the app.
    */
    __constructor: function(app) {
      this.app = app;
    },

    /**
    * Performs setup. To be overriden in the input class
    * @methodOf input.prototype
    * @param {Function} callbackOnReady Callback when ready to accept.
    */
    setup: function(callbackOnReady) {
      // some inputs can have asynchronous initialization (network connection, USB ...)
      callbackOnReady(null);
    }
  });
});
