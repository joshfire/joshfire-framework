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

Joshfire.define(['joshfire/app', 'joshfire/class', 'joshfire/router', 'joshfire/tree.ui', './tree.data', 'templates_compiled/js/page', 'templates_compiled/js/index', 'templates_compiled/js/video'], function(App,Class,Router,UITree,Data,PageTemplate,IndexTemplate,VideoTemplate) {

  var UI = Class(UITree, {
    buildTree: function() {
      var app = this.app;
      return {
        'id': 'root',
        'type': 'panel',
        'template': PageTemplate,
        'children': [
          /*
          {
          "id":"index",
          "autoInsert":false,
          "type":"panel",
          "template":IndexTemplate,
          "children":[
          {
          id:"videolist",
          type:"list",
          dataPath:"/videos/",
          itemTemplate:"<li><a href='/video/<%=item.id%>'><img src='<%=item.image%>' /><%=item.label%></a></li>"
          }
          ]
          },
          */
          {
            'id': 'video',
            'autoInsert': false,
            'template': VideoTemplate,
            'type': 'panel',
            'children': [
              {
                'id': 'player',
                'type': 'video.mediaelement'
              }
            ]
          }
        ]
      };
    }
  });

  return Class(App, {
    uiClass: UI,
    dataClass: Data,
    // Routes are tested in this order.
    // Format is [route, target]
    routes: [
      ['video/:id', 'video'],
      ['', 'index']
    ],
    setup: function(callback) {
      var self = this;
      // Here we can plug our custom controller
      // This is impractical with a lot of views, see examples/docs/ for a solution with a panel.controller
      this.subscribe('state', function(ev,data) {
        if (data[0] == 'route') {
          var page = self.ui.element('/' + data[1].target);
          page.insert();
          if (page.id == 'video') {
            page.setDataPath('/videos/' + data[1].params.id);
          }
        }
      });
      this.router = new Router(this, this.routes);
      callback(null, true);
    }
  });
});
