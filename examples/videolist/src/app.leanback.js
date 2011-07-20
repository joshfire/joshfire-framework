/*!
 * Joshfire Framework 0.9.1
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jul 20 19:23:09 2011
 */


/*!
* Joshfire Framework 0.9.1
* http://framework.joshfire.com/
*
* Copyright 2011, Joshfire
* Dual licensed under the GPL Version 2 and a Commercial license.
* http://framework.joshfire.com/license
*
* Date: Wed Jul 20 19:18:46 2011
*/


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


Joshfire.define(['./app', 'joshfire/class', 'joshfire/vendor/underscore', 'joshfire/utils/activitymonitor'],
    function(App, Class,  _, ActivityMonitor) {

      return Class(App, {

        setup: function(callback) {
          var self = this;

          this.__super();


          self.subscribe('afterInsert', function(ev, info) {

            self.activitymonitor = new ActivityMonitor(self, {
              'uiActive': ['/videolist', '/controls'],
              'delay': 5000
            });

            self.ui.element('/videolist').subscribe('fresh', function() {
              self.activitymonitor.activate();
            });

          });

          callback(null, true);
        }

      });
    });
