/*!
 * Joshfire Framework 0.9.1
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jul 20 20:19:42 2011
 */

Joshfire.define(['joshfire/input', 'joshfire/class', 'joshfire/vendor/zepto'], function(Input, Class, $) {

  /**
  * @class Input interface for touch events on iOS
  * @name adapters_ios_inputs_touch
  * @augments input
  */
  return Class(Input, {

    setup: function(callback) {
      var self = this;

      function hasTouchEvent() {
        try {
          document.createEvent('TouchEvent');
          return true;
        } catch (e) {
          return false;
        }
      }

      $(window).live(hasTouchEvent() ? 'tap MozTouchDown' : 'mousedown', function(e) {
        for (var target = this; target && target != document; target = target.parentNode) {
          if ($(target).attr('data-josh-ui-path')) {
            self.app.ui.element($(target).attr('data-josh-ui-path')).publish('input', ['enter', $(target).attr('data-josh-grid-id')], true);
            break;
          }
        }
      });

      callback(null);
    }
  });


});
