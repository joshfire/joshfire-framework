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


Joshfire.define(['joshfire/class', 'joshfire/tree.ui', 'joshfire/uielements/list'], function(Class, UITree, List) {

  return Class(UITree, {

    buildTree: function() {
      // Create UI widgets
      return [
        {
          id: 'newsList',             // internal id
          type: List,                 // type of ui widget
          orientation: 'left',        // change navigations properties of the grid
          dataPath: '/news/',         // data which will be used to populate the list
          itemInnerTemplate:          // override default template for list items
              '<div class="clearfix">' +
              '    <h1 class="title"><%= item.title %></h1>' +
              '    <img src="<%= item.thumbnail %>" />' +
              '    <div class="description"><%= item.description %></div>' +
              '    <a href="<%= item.link %>" target="_blank"><%= item.link %></a>' +
              '</div>'
        }
      ];
    }

  });

});
