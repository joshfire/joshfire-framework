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


Joshfire.define(['joshfire/class', 'joshfire/tree.ui'], function(Class, UITree) {
  return Class(UITree, {

    buildTree: function() {
      var app = this.app;

      return [
        {
          id: 'player',
          //"type":"video.youtube.swf"
          type: 'video.mediaelement',
          // path to the .swf player file, if needed
          mediaElementDefaultsPluginPath: '/public/swf/',
          autoShow: false
        },
        {
          id: 'controls',
          type: 'mediacontrols',
          media: '/player'
        },
        {
          id: 'videolist',
          type: 'list',
          itemInnerTemplate: '<figure><img src="<%= item.image %>"/><figcaption><%=item.label%></figcaption></figure>',
          scroller: true,
          scrollOptions: {
            vScroll: false,
            hScroll: true
          },
          scrollBarClass: 'rainbow',
          dataPath: '/videos/',
          autoScroll: true,
          onSelect: function(ui,evt,data) {
            document.getElementById(app.ui.element('/player').htmlId).style.display = 'block';
            app.ui.element('/player').play(ui.getDataById(data[0][0]));
          }
        }
      ];
    }
  });
});
