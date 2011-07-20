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

Joshfire.define(['joshfire/main'], function(J) {

  /**
  * @class Publish-Subscribe mixin
  * @name mixins_pubsub
  */
  return {
    mixin: function(target) {


      target.__pubsubSubscribes = false;

      target.__pubsubLastUid = -1;


      /*https://github.com/mroderick/PubSubJS/blob/master/pubsub.js*/
      
      /**
      * Send an event. Publishes the the message, passing the data to its subscribers
      * @methodOf mixins_pubsub#
      * @name publish
      * @param {String} message The message to publish.
      * @param data The data to pass to subscribers.
      * @param {Boolean} sync Forces publication to be syncronous, which is more confusing, but faster.
      */
      target.publish = function(message, data, sync) {

        if (J.debug && message != 'timeupdate') {
          console.log('publish', this.id, message, data, sync);
        }

        // if there are no subscribers to this message, just return here
        if (!this.__pubsubSubscribes.hasOwnProperty(message) && !this.__pubsubSubscribes.hasOwnProperty('*')) {
          return false;
        }
        var self = this;
        var deliverMessage = function() {
          var subscribers = (self.__pubsubSubscribes[message] || []).concat(self.__pubsubSubscribes['*'] || []);
          var throwException = function(e) {
            return function() {
              throw e;
            };
          };

          for (var i = 0, j = subscribers.length; i < j; i++) {

            //try {
            //console.log(message,data,subscribers.length,i,subscribers[i]);
            if (subscribers[i]) subscribers[i].func(message, data, subscribers[i].token);
            //} catch( e ){
            //    setTimeout( throwException(e), 0);
            //}
          }
        };

        if (sync === true) {
          deliverMessage();
        } else {
          setTimeout(deliverMessage, 0);
        }
        return true;
      };


      /**
      * Subscribes the passed function to the passed message. Every returned token is unique and should be stored if you need to unsubscribe
      * @methodOf mixins_pubsub#
      * @name subscribe
      * @param {String} message The message to subscribe to.
      * @param {Function} func The function to call when a new message is published.
      * @return {String} token for unsubscribing.
      **/
      target.subscribe = function(message, func) {

        if (this.__pubsubSubscribes === false) {
          this.__pubsubSubscribes = {};
        }

        // message is not registered yet
        if (!this.__pubsubSubscribes.hasOwnProperty(message)) {
          this.__pubsubSubscribes[message] = [];
        }

        // forcing token as String, to allow for future expansions without breaking usage
        // and allow for easy use as key names for the 'this.__pubsubSubscribes' object
        var token = (++this.__pubsubLastUid).toString();
        this.__pubsubSubscribes[message].push({
          token: token,
          func: func
        });

        // return token for unsubscribing
        return token;
      };


      /**
      * Unsubscribes a specific subscriber from a specific message using the unique token
      * @name unsubscribe
      * @methodOf mixins_pubsub#
      * @param {String} token The token of the function to unsubscribe.
      **/
      target.unsubscribe = function(token) {
        for (var m in this.__pubsubSubscribes) {
          if (this.__pubsubSubscribes.hasOwnProperty(m)) {
            for (var i = 0, j = this.__pubsubSubscribes[m].length; i < j; i++) {
              if (this.__pubsubSubscribes[m][i].token === token) {
                this.__pubsubSubscribes[m].splice(i, 1);
                return token;
              }
            }
          }
        }
        return false;
      };

    }
  };

});
