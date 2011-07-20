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

Joshfire.define(['joshfire/class', 'joshfire/tree.ui'], function(Class, UITree) {
  return Class(UITree, {
    buildTree: function() {
      var app = this.app;

      return [
        {
          id: 'list',
          type: 'list',
          dataPath: '/photos',
          autoShow: false,
          hideOnBlur: true,
          itemInnerTemplate: '<a href="<%= item.url %>"><figure><img src="<%= item.image %>" /><figcaption><%= item.label %></figcaption></figure></a>'
        }
      ];
    }
  });
});
