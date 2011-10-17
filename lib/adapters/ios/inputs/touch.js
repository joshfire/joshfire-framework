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

      // When using iScroll, touchstarts are first handled here but passed because of elt.hasScroller.
      // Then come back as "click" events that iScroll generates if the touch was a tap and not a swipe
      // In this case it is only then than we treat them as an input
      
      // The case !hasTouchEvent() helps for browser testing only.
      
      $(window).live(hasTouchEvent() ? 'touchstart click tap MozTouchDown' : 'mousedown click', function(e) {
        for (var target = this; target && target != document; target = target.parentNode) {
          if ($(target).attr('data-josh-ui-path')) {
            var elt = self.app.ui.element($(target).attr('data-josh-ui-path'));
            if ((!elt.hasScroller && e.type!="click" /* && e.type!='touchstart'*/) || (e.type=="click" && elt.hasScroller)) {
             elt.publish('input', ['enter', $(target).attr('data-josh-grid-id'), this], true);
            }
            break;
          }
        }
      });
      
      //Swipe(s) only for touch devices
      if (hasTouchEvent){
        $(window).live('swipeLeft swipeRight swipeUp swipeDown', function (e){
          for (var target = this; target && target != document; target = target.parentNode) {
            if ($(target).attr('data-josh-ui-path')) {
              var elt = self.app.ui.element($(target).attr('data-josh-ui-path'));
              elt.publish('swipe', [e.type.replace(/swipe/,'').toLowerCase(), $(target).attr('data-josh-grid-id'), this], true);
              break;
            }
          }
        });
        
      }

      callback(null);
    }
  });

});
