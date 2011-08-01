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

Joshfire.define(['joshfire/class', 'joshfire/tree.ui', 'joshfire/uielements/video.mediaelement', 'joshfire/uielements/list'], function(Class, UITree, VideoMediaElement, List) {
  return Class(UITree, {

    buildTree: function() {
      // UI specialization : the video list scrolls from top to bottom only on iOS
      if (Joshfire.adapter === 'ios') {
        var bVerticalList = true;
      } else {
        var bVerticalList = false;
      }

      var app = this.app;

      // our UI definition
      var aUITree = [
        {
          id: 'player',
          type: VideoMediaElement,
          // path to the .swf player file, if needed
          mediaElementDefaultsPluginPath: './swf/',
          autoShow: false,
          options: {
            forceAspectRatio: false,
            //width:window.innerWidth,
            height: window.innerHeight
          }
        },
        {
          id: 'videolist',
          type: List,
          // modify default content of the <li>. item correspond to the childrens of videos/ in the data tree
          itemInnerTemplate: '<figure><img src="<%= item.image %>"/><figcaption><%=item.label%></figcaption></figure>',
          scroller: true,
          scrollOptions: {
            // do scroll in only one direction
            vScroll: bVerticalList,
            hScroll: !bVerticalList
          },
          scrollBarClass: 'scrollbar',
          dataPath: '/videos/',
          autoScroll: true,
          onSelect: function(ui,evt,data) {
            document.getElementById(app.ui.element('/player').htmlId).style.display = 'block';
            app.ui.element('/player').play(ui.getDataById(data[0][0]));
          }
        }
      ];

      // UI specialization : the video control bar is useless on environments without a mouse
      //console.log(Joshfire.adapter);
      if (Joshfire.adapter === 'browser') {
        aUITree.push({
          id: 'controls',
          type: 'mediacontrols',
          media: '/player'
        });
      }

      return aUITree;
    }
  });
});
