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

Joshfire.define(['joshfire/adapters/browser/inputs/keyboard', 'joshfire/class'], function(Input, Class, $) {

  /**
  * @class Input interface for GoogleTV with support for special media keys
  * @name adapters_googletv_inputs_keyboard
  * @augments adapters_browser_inputs_keyboard
  */
  return Class(Input, {

    keyCodeToInputEvent: function() {

      //special googletv media keys
      //http://code.google.com/tv/web/docs/implement_for_tv.html
      return _.extend(this.__super(), {
        '179': 'play',
        '178': 'stop',
        '176': 'forward',
        '177': 'rewind'
      });

    }

  });


});
