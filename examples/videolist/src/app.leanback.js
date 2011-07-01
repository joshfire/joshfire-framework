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


Joshfire.define(['./app', 'joshfire/class', 'joshfire/vendor/underscore'],
  function(App, Class,  _) {

    return Class(App, {

      setup: function(callback) {
        var self = this;

        this.__super();

        self.subscribe('afterInsert', function(ev, info) {
          var videolist = self.ui.element('/videolist'),
              controls = self.ui.element('/controls');

          function update() {
            videolist.show();
            videolist.hideDelayed();
            if (controls) {
              controls.show();
              controls.hideDelayed();
            }
          }

          $('#' + self.id + '__').mousemove(update);
          self.ui.element('/videolist').subscribe('fresh', update);
        });

        callback(null, true);
      }

    });
});
