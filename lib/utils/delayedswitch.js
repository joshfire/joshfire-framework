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

Joshfire.define(['joshfire/class'], function(Class) {


  return Class(
      /**
      * @lends utils_delayedswitch.prototype
      */
      {

        /**
        * @constructs
        * @class A on/off switch with delay and reset
        * @param {Function} stateON callback when ON.
        * @param {Function} stateOFF callback when OFF.
        * @param {Integer} delayON delay before calling stateON.
        */
        __constructor: function(stateON, stateOFF, delayON /*, todo delayOFF*/ ) {
          this._on = stateON;
          this._off = stateOFF;
          this.delayON = delayON;
          this.timer = false;
        },

        /**
        * @function on
        *
        */
        on: function() {
          if (!this.delayON) {
            if (this._on) this._on();
          } else if (!this.timer) {
            var self = this;
            this.timer = setTimeout(function() {
              self.timer = false;
              if (self._on) self._on();
            }, this.delayON);
          }
        },

        /**
        * @function off
        *
        */
        off: function() {
          if (this.timer) {
            clearTimeout(this.timer);
            this.timer = false;
          }
          if (this._off) this._off();
        },

        /**
        * @function reset
        *
        */
        reset: function() {
          this.off();
          this.on();
        }
      });


});
