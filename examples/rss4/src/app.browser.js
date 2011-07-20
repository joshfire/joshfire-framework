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

Joshfire.define(['./app', 'joshfire/class', 'joshfire/vendor/underscore', 'joshfire/vendor/jquery'], function(App, Class, _, $) {
  return Class(App, {
    setup: function(callback) {
      var self = this;
      this.__super();
      self.ui.element('/newsList').subscribe('data', function(ev) {
        self.ui.moveTo('focus', '/newsList');
      });
      Joshfire.require(['public/js/jquery.colorbox-min'], function() {
        self.ui.element('/newsInfo').subscribe('afterRefresh', function(ev, id) {
          self.ui.moveTo('focus', '/newsInfo');
          $.colorbox({width: '800px', inline: true, href: '#' + self.ui.element('/newsInfo').htmlId + ' .info',
            onCleanup: function() {
              //self.ui.element('/newsInfo').hide();
              self.ui.moveTo('focus', '/newsList');
            }
          });
        });
      });
      if (callback) {
        callback(null, true);
      }
    }
  });
});
