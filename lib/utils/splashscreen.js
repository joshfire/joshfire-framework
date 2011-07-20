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


Joshfire.define(['joshfire/class', 'joshfire/vendor/underscore'], function(Class, _) {


  return Class(
      /**
      * @lends utils_splashscreen.prototype
      */
      {

        /**
        * @constructs
        * @class Splashscreen util
        * @param {Object} options
        */
        __constructor: function(options) {
          options = _.extend({
            'htmlId': 'splashscreen'
          }, options);
          this.id = options.htmlId;

          if (options.timeout) {
            var self = this;
            setTimeout(function() {
              self.remove();
            }, options.timeout);
          }


        },

        /**
        * @function
        * @param {Object} options
        */
        remove: function(options) {
          //Options : transition,
          if (document) {
            document.getElementById(this.id).style.display = 'none';
          }
        }
      });

});
