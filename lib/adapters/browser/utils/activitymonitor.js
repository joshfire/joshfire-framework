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

Joshfire.define(['joshfire/class', 'joshfire/vendor/jquery', 'joshfire/vendor/underscore', 'joshfire/mixins/pubsub', 'joshfire/mixins/state'], function(Class, $, _, PubSub, State) {

  var M = Class(
      /**
      * @lends adapters_browser_utils_activitymonitor.prototype
      */
      {

        /**
        * @constructs
        * @borrows mixins_pubsub#publish as #publish
        * @borrows mixins_pubsub#subscribe as #subscribe
        * @borrows mixins_pubsub#unsubscribe as #unsubscribe
        * @borrows mixins_state#setState as #setState
        * @borrows mixins_state#setStates as #setStates
        * @borrows mixins_state#getState as #getState
        * @borrows mixins_state#onState as #onState
        * @borrows mixins_state#deleteState as #deleteState
        * @class Activity monitor for hiding elements when user is idle
        */
        __constructor: function(app, options) {
          this.app = app;
          this.disabled = false;
          this.locked = false;
          this.options = _.extend({
            'delay': 5000,
            'uiActive': false,
            'events': ['hover', 'keydown', 'mousemove', 'click', 'touchstart', 'joshactivity']
          }, options);

          this.setState('active', true);

          var self = this;
          if (self.options.uiActive) {

            self.subscribe('state', function(ev,data) {
              if (data[0] == 'active') {
                for (var i = 0, l = self.options.uiActive.length; i < l; i++) {
                  var elt = self.app.ui.get(self.options.uiActive[i]);
                  if (elt && elt.element) {
                    if (data[1]) {
                      elt.element.show();
                    } else {
                      elt.element.hide();
                    }
                  }
                }
              }

            });
          }

          this.timer = false;
          $(this.app.baseHtmlEl).bind(this.options.events.join(' '), function() {
            self.activate();
          });

        },

        activate: function() {
          var self = this;

          if (self.locked || self.disabled) return;

          if (this.timer) {
            clearTimeout(this.timer);
          } else {
            self.setState('active', true);
          }

          this.timer = setTimeout(function() {
            if (self.locked || self.disabled) return;

            self.timer = false;
            self.setState('active', false);
          },self.options.delay);

        },


        enable: function() {
          this.disabled = false;
        },

        disable: function() {
          this.disabled = true;
        },

        lock: function() {
          this.locked = true;
        },
        unlock: function() {
          this.locked = false;
        }

      });


  PubSub.mixin(M.prototype);
  State.mixin(M.prototype);

  return M;

});
