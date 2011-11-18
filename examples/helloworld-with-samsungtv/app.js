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

Joshfire.define(['joshfire/app', 'joshfire/class'], function(App, Class) {
  return Class(App, {
    uiTree: {
      'id': 'root',
      'type': 'panel',
      'content': 'Hello world'
    },
    setup: function(callback) {
      console.log('Initialization is taking place...');
      callback(null, true);
    }
  });
});
