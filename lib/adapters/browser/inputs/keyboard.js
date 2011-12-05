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

Joshfire.define(['joshfire/input', 'joshfire/class', 'joshfire/vendor/jquery'], function(Input, Class, $) {

  /**
  * @class Input interface for keyboards
  * @name adapters_browser_inputs_keyboard
  * @augments input
  */
  return Class(Input,
      /**
      * @lends adapters_browser_inputs_keyboard.prototype
      */
      {


        keyCodeToInputEvent: function() {

          return {
            '13': 'enter',
            '27': 'exit',
            '32': 'enter', //space
            '37': 'left',
            '38': 'up',
            '39': 'right',
            '40': 'down'
          };

        },


        /**
        * start
        * @function
        */
        setup: function(callbackOnReady) {
          var self = this;

          var map = this.keyCodeToInputEvent();

          $(window).bind('keydown', function(e) {
            if (!e) e = window.event;

            if (map[e.keyCode + '']) {
              self.app.publish('input', [map[e.keyCode + '']]);
            }

          });

          callbackOnReady(null);

        }

      });


});
