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
  * @class Silent media controls on iOS that has a native video player
  * @name adapters_ios_uielements_mediacontrols
  * @extends {uielement}
  */
  return Class(UIElement,
      /**
      * @lends adapters_android_uielements_list.prototype
      */
      { type: 'MediaControls',
        /**
        * @function init
        *
        */
        init: function() {
        },


        /**
        * @function inner html
        * returns {String} empty
        */
        getInnerHtml: function() {
          return '';
        },
        /**
        * @ignore
        * @function refresh
        *
        */
        refresh: function() {

        },

        /**
        * @ignore
        *@function
        *
        */
        show: function() {

        },
        /**
        * @ignore
        * @function
        *
        */
        hide: function() {

        }


      });


});
