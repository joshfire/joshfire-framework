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

Joshfire.define(['joshfire/input', 'joshfire/class', 'joshfire/vendor/json2'],
    function(Input, Class) {
      return Class(Input, {
        /*
        
        -          Make sure VK_PLAY, VK_PAUSE And VK_STOP work!
        
        
        */
         keyCodeToInputEvent: function() {
           //debugging in a browser ?
           //Let's handle specific key codes
           if (typeof VK_PLAY==='undefined'){
             VK_PLAY=116;
             VK_PAUSE=130;
             VK_STOP=117;
           }
            return {
              VK_PLAY: 'play',
              VK_PAUSE: 'pause',
              VK_STOP: 'stop',
              13: 'enter',
              27: 'exit',
              32: 'enter', //space
              37: 'left',
              38: 'up',
              39: 'right',
              40: 'down'/*,
              124:'green',// ?
              125:'red',//?
              126:'yellow',//?
              127:'blue',//? */
            };

          },
        setup:function(callback){
          
          var self = this;
          document.addEventListener('keydown',function(e){
           var map = self.keyCodeToInputEvent(),
            strEvent = map[e.keyCode];
            //console.warn('input', e.keyCode, strEvent)
            if (strEvent) {
                self.app.publish('input', [strEvent]);
            }
          },true);
          callback();
        }
        
      }); // /return Class()
    });// /J.define