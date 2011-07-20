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

Joshfire.define(['joshfire/app', 'joshfire/class', './tree.data', './tree.ui'], function(App, Class, Data, UI) {
  return Class(App, {
    id: 'tweetMap',
    uiClass: UI,
    dataClass: Data,
    setup: function(callback) {
      var self = this;
      self.subscribe('afterInsert', function() {
        self.ui.moveTo('focus', '/menu');
        self.ui.element('/menu').selectByIndex(0);
      });
      callback(null, true);
    }
  });
});
