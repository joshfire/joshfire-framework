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

Joshfire.define(['./app', 'joshfire/class', 'joshfire/vendor/underscore'], function(App, Class, _) {
  return Class(App, {
    setup: function(callback) {
      var self = this;
      this.__super();
      self.ui.element('/newsInfo').subscribe('afterRefresh', function(ev, id) {
        self.ui.element('/newsInfo').show();
      });
      self.ui.element('/newsInfo').subscribe('input', function(ev, id) {
        if (id[0] == 'enter') {
          self.ui.element('/newsInfo').hide();
        }
      });
      if (callback)
        callback(null, true);
    }
  });
});
