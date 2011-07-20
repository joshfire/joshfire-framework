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

Joshfire.define(['../../../uielements/panel', 'joshfire/class', 'joshfire/vendor/underscore'], function(Panel, Class, _) {

  return Class(Panel, {

    getInnerHtml: function() {

      var html = '';
      var self = this;

      var elts = self.children;

      if (elts && elts.length) {

        for (var i = 0; i < elts.length; i++) {
          html += elts[i].getHtml();
        }

        return html;

      } else {
        return this.__super();
      }


    }
  });




});
