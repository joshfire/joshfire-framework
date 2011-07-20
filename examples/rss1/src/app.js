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

Joshfire.define(['joshfire/app', 'joshfire/class', 'joshfire/uielements/list'], function(BaseApp, Class, List) {
  return Class(BaseApp, {
    id: 'exampleRss',
    uiTree: [
      {
        id: 'newsList',             // internal id
        type: List,                 // type of ui widget
        dataPath: '/news/',         // data which will be used to populate the list
        itemInnerTemplate:          // override default template for list items
            '<div class="clearfix">' +
            '  <h1 class="title"><%= item.title %></h1>' +
            '  <div class="description"><%= item.description %></div>' +
            '  <a href="<%= item.link %>"><%= item.link %></a>' +
            '</div>'
      }
    ],
    dataTree: [
      {
        id: 'news',
        children: [
          {id: 0, title: 'title1', description: 'this is a description!', link: 'http://wikipedia.org'},
          {id: 1, title: 'title2', description: 'this is a another one!', link: 'http://creativecommons.org'},
          {id: 2, title: 'title3', description: 'this is the last one!', link: 'http://fsf.org'}
        ]
      }
    ]
  });
});
