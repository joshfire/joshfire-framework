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

define(['joshlib!vendor/underscore'], function(_) {


  /**
  * @class State storage and events mixin
  * @name mixins_state
  */
  return {
    mixin: function(target) {

      /**
      * Sets a state
      * @methodOf mixins_state#
      * @name setState
      * @param {string} register
      * @param {var} state
      **/
      target.setState = function(register, state) {
        if (!this.__stateStore) this.__stateStore = {};

        if (!_.isEqual(this.__stateStore[register], state)) {
          this.__stateStore[register] = state;
          if (this.trigger) this.trigger('state', [register, state]);
        }
      };

      /**
      * Set hash of states and send events only after
      * @methodOf mixins_state#
      * @name setStates
      * @param {Object} states Hash of states.
      **/
      target.setStates = function(states) {
        if (!this.__stateStore) this.__stateStore = {};

        var self = this;

        var events = [];

        _.each(states, function(state, register) {
          if (!_.isEqual(self.__stateStore[register], state)) {
            self.__stateStore[register] = state;
            events.push([register, state]);
          }
        });

        _.each(events, function(ev) {
          if (self.trigger) self.trigger('state', ev);
        });
      };

      /**
      * Deletes a state
      * @methodOf mixins_state#
      * @name deleteState
      * @param {string}
      **/
      target.deleteState = function(register) {
        if (!this.__stateStore) this.__stateStore = {};
        delete this.__stateStore[register];
      };

      /**
      * Listens to a state or fire immediately if already in this state. target must have the pubsub mixin.
      * @methodOf mixins_state#
      * @name onState
      * @param {string}
      **/
      target.onState = function(register,value,callback) {
        if (this.getState(register) == value) {
          callback();
        }
        this.bind('state', function(data) {
          if (data[0] == register && data[1] == value) {
            callback();
          }
        });
      };

      /**
      * Returns a state
      * @methodOf mixins_state#
      * @name getState
      * @param {string} register
      **/
      target.getState = function(register) {
        if (!this.__stateStore) this.__stateStore = {};
        if (!register) {
          return this.__stateStore;
        }
        return this.__stateStore[register];
      };
    }
  };

});
