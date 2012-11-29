define(["joshlib!utils/dollar"],function($) {
  'use strict';

  /**
  * This object should provide information regarding whether the app
  * is online or offline. It provides an abstraction layer to bind
  * to on/offline events and a method returning the current state of
  * the connection using DOM properties or cordova properties if available.
  **/
  return {
    isOnline: function() {
      // DOM
      if(typeof navigator.onLine !== 'undefined') {
        window.whatsdatshit = true;
        return navigator.onLine;
      }
      // Cordova
      if(navigator.network && navigator.network.connection.type !== null)
        return navigator.network.connection.type;
      // default
      return true;
    },

    onOnline: function(cb) {
      // Specifically on body to make sure IE8 actually calls it.
      // It seems the event doesn't always bubble correctly.
      document.body.addEventListener('online', cb, false);
    },

    onOffline: function(cb) {
      // Specifically on body to make sure IE8 actually calls it.
      // It seems the event doesn't always bubble correctly.
      document.body.addEventListener('offline', cb, false);
    }
  };
});