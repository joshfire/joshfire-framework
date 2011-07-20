/*!
 * Joshfire Framework 0.9.1
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jul 20 19:23:09 2011
 */


/*!
* Joshfire Framework 0.9.1
* http://framework.joshfire.com/
*
* Copyright 2011, Joshfire
* Dual licensed under the GPL Version 2 and a Commercial license.
* http://framework.joshfire.com/license
*
* Date: Wed Jul 20 19:18:46 2011
*/


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

Joshfire.define(['joshfire/app', 'joshfire/class', './tree.data', './tree.ui'], function(BaseApp, Class, Data, UI) {
  return Class(BaseApp, {
    id: 'exampleRss',
    uiClass: UI,
    dataClass: Data,
    setup: function(callback) {
      var self = this;
      console.log(self);
      self.ui.element('/newsList').subscribe('data', function(ev) {
        self.ui.moveTo('focus', '/newsList');
      });
      callback(null, true);
    }
  });
});
