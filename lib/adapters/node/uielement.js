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


Joshfire.define(['../../uielement', 'joshfire/class', 'joshfire/vendor/underscore'], function(UIElement, Class, _) {

  return Class(UIElement, {

    getDefaultOptions: function() {
      return _.extend(this.__super(), {
        template: "<div id='<%= htmlId %>' class='josh-type-<%=type%> josh-id-<%=id%>'><%= htmlOuter %></div>"
      });
    },

    _show: function() {
      this.hidden = false;
    },

    _hide: function() {
      this.hidden = true;
    }


  });

});
