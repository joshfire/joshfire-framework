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

Joshfire.define(['joshfire/class', 'joshfire/tree.ui', 'joshfire/uielements/list'], function(Class, UITree, List) {

  return Class(UITree, {

    buildTree: function() {
      // Create UI widgets
      return [
        // A UI List Element
        {
          id: 'newsList',             // internal id
          type: List,                 // type of ui widget
          orientation: 'left',        // change navigations properties of the grid
          dataPath: '/news/',         // data which will be used to populate the list
          itemInnerTemplate:          // override default template for list items
              '<div class="clearfix">' +
              '    <h1 class="title"><%= item.title %></h1>' +
              '    <img src="<%= item.image %>" />' +
              '    <div class="description"><%= item.description %></div>' +
              '</div>'
        }
      ];
    }

  });

});
