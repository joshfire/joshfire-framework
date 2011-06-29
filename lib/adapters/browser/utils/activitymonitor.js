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


Joshfire.define(['joshfire/class', 'joshfire/vendor/jquery', 'joshfire/vendor/underscore'], function(Class, $, _) {


  return Class({

    __constructor: function(app, options) {
      this.app = app;
      this.disabled = false;
      this.locked = false;
      this.options = _.extend({
        'timeout': 5000
      }, options);

    },

    enable: function() {
      this.disabled = false;
    },

    disable: function() {
      this.disabled = true;
    },

    lock: function() {
      this.locked = true;
    },
    unlock: function() {
      this.locked = false;
    }

  });


});
