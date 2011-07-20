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

Joshfire.define(['joshfire/class', 'joshfire/tree.ui', 'joshfire/uielements/list', 'joshfire/uielements/panel'], function(Class, UITree, List, Panel) {

  return Class(UITree, {

    buildTree: function() {
      // Create UI widgets
      return [
        {
          id: 'newsList',             // internal id
          type: List,                 // type of ui widget
          orientation: 'left',        // change navigations properties of the grid
          dataPath: '/news',          // data which will be used to populate the list
          noMouseAutoFocus: true,     // deactivate focus on mouse hover
          moveOnFocus: true,          // keep focused element on display
          itemInnerTemplate:          // override default template for list items
              '<div class="clearfix">' +
              '    <h1 class="title"><%= item.title %></h1>' +
              '    <img src="<%= item.image %>" />' +
              '    <div class="description"><%= item.description %></div>' +
              '</div>',
          loadingTemplate: null       // override default template used during data loading
        },
        {
          id: 'newsInfo',             // internal id
          type: Panel,                // type of UI widget
          uiDataMaster: '/newsList',  // bind this element to listen change on its master (parent)
          autoShow: false,            // hide the element
          showOnFocus: false,         // disable auto-show on focus as it is not always the desired behaviour
          forceDataPathRefresh: true, // fire a refresh event event if dataPath was not changed
          innerTemplate:              // override default template for the element
              '<div class="info">' +
              '  <p class="title"><%= data.title %></p>' +
              '  <div class="clearfix">' +
              '    <img src="<%= data.image %>" />' +
              '    <p class="description"><%= data.description %></p>' +
              '    <p class="author"><%= data.creator %></p>' +
              '    <p class="date"><%= data.pubDate %></p>' +
              '    <p class="comments"><%= data.commentsCount %> comments</p>' +
              '  </div>' +
              '  <div class="clearfix">' +
              '  <ul class="category clearfix">' +
              '    <% for (name in data.category) { %> <li><%= data.category[name] %></li> <% }; %>' +
              '  </ul>' +
              '  </div>' +
              '</div>',
          loadingTemplate: null       // override default template used during data loading

        }
      ];
    }

  });

});
