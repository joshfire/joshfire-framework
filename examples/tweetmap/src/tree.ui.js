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
          id: 'menu',
          type: 'list',
          data: [
            {
              id: 'list',
              label: 'Liste'
            },
            {
              id: 'map',
              label: 'Map'
            }
          ],
          autoShow: true
        },

        {
          id: 'manager',
          type: 'panel.manager',
          uiMaster: '/menu',
          children: [
            {
              id: 'list',
              type: 'list',
              scroller: true,
              dataPath: '/tweets',
              itemInnerTemplate: '<img src="<%= item.image %>" /><span><%=item.label%></span>',
              autoShow: false
            },
            {
              id: 'map',
              type: 'map',
              mapType: 'roadmap',
              zoom: 11,
              dataPath: '/tweets',
              width: 780,
              height: 300,
              autoShow: false,
              onSelect: function(that, event, data) {
                console.warn('map select', data);
              }
            }
          ]
        }
      ];
    }
  });
});
