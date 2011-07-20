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

Joshfire.require(['joshfire/class', 'joshfire/app', 'joshfire/utils/eventsocket', 'joshfire/inputs/http'], function(Class,App,EventSocket,HttpInput) {
  var arduinoApp = new App({
    inputs: [HttpInput],
    autoSetup: false
  });
  arduinoApp.setupAll(function() {
    console.log('setuped');
    var evSocket = new EventSocket(arduinoApp, {});
    evSocket.setup(function() {
      console.log('ev socket listening');
    });
  });
});
