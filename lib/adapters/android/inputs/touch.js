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

Joshfire.define(['joshfire/input', 'joshfire/class', 'joshfire/vendor/zepto'],
    function(Input, Class, $) {
      /**
      * @class Input interface for touch events
      * @name adapters_android_inputs_touch
      * @augments input
      */
      return Class(Input, {

        setup: function(callback) {
          var self = this;

          //window.addEventListener('tap', function(e) {
          /*document.addEventListener('click', function(e) {
          for (var target = this; target && target != document; target = target.parentNode) {
          if (target.getAttribute('data-josh-ui-path')) {
          self.app.ui.element( target.getAttribute('data-josh-ui-path') )
          .publish('input', ['enter', target.getAttribute('data-josh-grid-id')], true);
          break;
          }
          }
          });
          */

          $(window).live('click', function(e) {
            for (var target = this; target && target != document; target = target.parentNode)
              if ($(target).attr('data-josh-ui-path')) {
                self.app.ui.element($(target).attr('data-josh-ui-path')).publish('input', ['enter', $(target).attr('data-josh-grid-id')], true);
                break;
              }

          });

          // phonegap provides us the link to the back button and the other physical buttons
          // http://docs.phonegap.com/phonegap_events_events.md.html#Events
          document.addEventListener('deviceready', function() {
            /* other buttons android can send (not available on all devices)
            backbutton
            menubutton
            pause <= related to the state of the application, not to media events
            resume <= related to the state of the application, not to media events
            searchbutton
            */
            //console.log('ANDROID TOUCH DEVICEREADY');
            document.addEventListener(
                // back = exit
                'backbutton', function() {
                  self.app.publish('input', ['exit']);
                }, false);
          }, false);


          callback(null);
        }
      });
    });
