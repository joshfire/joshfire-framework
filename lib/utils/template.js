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

Joshfire.define(['joshfire/main', 'joshfire/class'], function(J, Class) {


  return Class(

      {
        /**
        * @function
        * @param {int}
        */
        initialize: function(id) {
          this.id = id;
        },
        /**
        * @function
        * @param {var}
        */
        evaluate: function(data) {
          return J.Templates[this.id](data);
        }
      });

});
