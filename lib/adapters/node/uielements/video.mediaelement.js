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

Joshfire.define(['joshfire/uielements/panel', 'joshfire/class', 'joshfire/vendor/underscore'], function(Panel, Class, _) {

  return Class(Panel, {

    getInnerHtml: function() {

      if (this.data && this.data.url) {
        return "<video src='" + this.data.url + "' />";
      }
      return '';

    }

  });

});
