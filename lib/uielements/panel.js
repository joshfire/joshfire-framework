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


Joshfire.define(['joshfire/uielement', 'joshfire/class'], function(UIElement, Class) {
  /**
  * @class Panel base class
  * @name uielements_panel
  * @augments uielement
  */
  return Class(UIElement,
      /**
      * @lends uielements_panel.prototype
      */
      {
        type: 'Panel',

        /**
        * Get panel inner html. this.options.content || this.data.content
        * @function
        *
        */
        getInnerHtml: function() {
          if (this.options.content) {
            return this.options.content;
          } else {
            if (this.data && this.data.content) {
              return this.data.content;
            } else {
              return this.__super();
            }
          }
        },

        refresh: function(callback) {
          // Don't refresh if we have children
          if (!this.children.length) {
            return this.__super(callback);
          }
        }
      }
  );
});
