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


Joshfire.define(['./app', 'joshfire/class', './tree.ui', 'joshfire/vendor/underscore', 'joshfire/inputs/http'],
    function(App, Class, UI, _, HttpInput) {
      return Class(App, {
        uiClass: UI,//leanbackUI,

        setup: function(callback) {
          var self = this;

          self.httpinput = new HttpInput(self, {
            server: 'http://' + window.location.hostname + ':8080'
          });

          self.httpinput.setup(function(err) {
            alert('listening');
            // Select first video on load
            self.ui.element('/videolist').subscribe('data', _.once(function(ev,data) {
              self.ui.setState('focus', '/videolist');
            }));

            // that event is fired when the mail Joshfire UI element is finally inserted
            self.subscribe('afterInsert', function() {
              self.ui.options.hideDelay = 400;
              var vl = self.ui.get('/videolist');
              vl.options.hideDelay = 400;
              vl.hideDelayed();
            });

            callback(null, true);
          });
        }
      });
    });
