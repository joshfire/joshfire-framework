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
