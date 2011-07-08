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


Joshfire.define(['joshfire/vendor/underscore'], function(_) {


  /**
  * State storage mixin
  * @class
  * @name mixins_state
  */
  return {
    mixin: function(target) {

      /**
      * @function
      * @name mixins_state.setState
      * @param {string} register
      * @param {var} state
      **/
      target.setState = function(register, state) {
        if (!this.__stateStore) this.__stateStore = {};

        if (!_.isEqual(this.__stateStore[register], state)) {
          this.__stateStore[register] = state;
          this.publish('state', [register, state], true);
        }
      };

      /**
      * Set hash of states and send events only after
      * @function
      * @name mixins_state.setStates
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
          self.publish('state', ev, true);
        });
      };

      /**
      * Deletes a state
      * @function
      * @name mixins_state.deleteState
      * @param {string}
      **/
      target.deleteState = function(register) {
        if (!this.__stateStore) this.__stateStore = {};
        delete this.__stateStore[register];
      };

      /**
      * Listens to a state or fire immediately if already in this state. target must have the pubsub mixin.
      * @function
      * @name mixins_state.deleteState
      * @param {string}
      **/
      target.onState = function(register,value,callback) {
        if (this.getState(register)==value) {
          callback();
        }
        this.subscribe("state",function(ev,data) {
          if (data[0]==register && data[1]==value) {
            callback();
          }
        });
      };
      
      /**
      * Returns a state
      * @function
      * @name mixins_state.getState
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
