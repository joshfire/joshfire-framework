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


Joshfire.define(['joshfire/app', 'joshfire/class', './tree.data', './tree.ui', 'joshfire/vendor/underscore', 'joshfire/utils/splashscreen'],
function(App, Class, Data, UI, _, Splash) {
  Joshfire.debug = true;
  
  // Behaviour specialization : some environments should not autoplay the video, as it is fullscreen
  if(Joshfire.adapter === 'samsungtv'
    || Joshfire.adapter === 'browser') {
    var bAutoPlay = true;
  } else {
    var bAutoPlay = false;
  }
  //console.log( 'JOSHFIRE');
  
  return Class(App, {
    id: 'exampleVideoList',
    uiClass: UI,
    dataClass: Data,
    setup: function(callback) {
      var self = this,
          splash = new Splash();
      // Select first video as soon we get the data
      self.ui.element('/videolist').subscribe('data', _.once(function(ev, data) {
        self.ui.setState('focus', '/videolist');
        if(bAutoPlay === true) {
          // retrieve the first element in the list and select it. 
          // the onSelect method in tree.ui.js does the rest
          self.ui.element('/videolist').selectByIndex(0);
        }
        //remove splash
        splash.remove();
      }));
      callback(null);
    }
  });
});
