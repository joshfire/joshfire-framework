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

Joshfire.define(['joshfire/app', 'joshfire/class', './tree.data', './tree.ui', 'joshfire/utils/splashscreen', 'joshfire/vendor/jquery'], function(BaseApp, Class, Data, UI, SC, $) {
  return Class(BaseApp, {
    id: 'exampleRss',
    uiClass: UI,
    dataClass: Data,
    setup: function(callback) {
      var self = this;
      var splashscreen = new SC();
      self.ui.element('/newsList').subscribe('data', function(ev) {
        splashscreen.remove();
      });
      self.ui.element('/newsList').subscribe('data', function(ev) {
        self.ui.moveTo('focus', '/newsList');
      });
      Joshfire.require(['public/js/jquery.colorbox-min'], function() {
        self.ui.element('/newsInfo').subscribe('afterRefresh', function(ev, id) {
          self.ui.moveTo('focus', '/newsInfo');
          $.colorbox({width: '800px', inline: true, href: '#' + self.ui.element('/newsInfo').htmlId + ' .info',
            onCleanup: function() {
              self.ui.moveTo('focus', '/newsList');
            }
          });
        });
      });
      callback(null, true);
    }
  });
});
