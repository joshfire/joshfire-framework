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
      
      // UI specialization : the video list scrolls from top to bottom only on iOS
      if(Joshfire.adapter === 'ios') {
        var bVerticalList = true;
      } else {
        var bVerticalList = false;
      }
      
      var app = this.app;
      
      // our UI definition
      var aUITree = [
        {
          id: 'player',
          type: 'video.mediaelement',
          // path to the .swf player file, if needed
          mediaElementDefaultsPluginPath: './swf/',
          autoShow: false,
          options:{
            forceAspectRatio:false,
            //width:window.innerWidth,
            height:window.innerHeight
          }
        },
        {
          id: 'videolist',
          type: 'list',
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
          hideDelay: 5000,
          onSelect: function(ui,evt,data) {
            document.getElementById(app.ui.element('/player').htmlId).style.display = 'block';
            app.ui.element('/player').play(ui.getDataById(data[0][0]));
          }
        }
      ];
      
      // UI specialization : the video control bar is useless on environments without a mouse
      //console.log(Joshfire.adapter);
      if(Joshfire.adapter === 'browser') {
        aUITree.push(  {
            id: 'controls',
            type: 'mediacontrols',
            media: '/player',
            hideDelay: 5000
          });
      }
      
      return aUITree;
    }
  });
});
