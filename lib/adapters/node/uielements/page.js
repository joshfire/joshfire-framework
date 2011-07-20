/*!
 * Joshfire Framework 0.9.1
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jul 20 20:19:42 2011
 */

Joshfire.define(['../../../uielements/page', 'joshfire/class'], function(Page, Class) {
  return Class(Page, {

    redirect: function(destination,code) {
      this.app.setHttpHeader('Location', destination);
      this.app.setHttpStatus(code || 302);

      return "<a href='" + destination + "'>See " + destination + '</a>';
    }

  });
});
