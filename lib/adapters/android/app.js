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


Joshfire.define(['joshfire/class', 'joshfire/adapters/browser/app', 'joshfire/main', 'joshfire/vendor/underscore', 'joshfire/adapters/android/inputs/touch', 'joshfire/inputs/mouse'],
    function(Class, App, J, _, Touch, Mouse) {
      return Class(App, {
        // the Android is a mix of the app coming from the browser
        getDefaultOptions: function() {
          // simply overwrite the parent
          var options = _.extend(this.__super(), {
            inputs: [Touch/*, Mouse*/],
            autoInsert: true
          });

          //alert(options.parentElement
          return options;
        }
      });// end return Class
    });// end closure and define
