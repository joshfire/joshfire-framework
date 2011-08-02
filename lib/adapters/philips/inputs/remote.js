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
        setup:function(callback){
          
          var self = this;
          document.addEventListener('keypress',function(e){
            
            //debugging in a browser ?
            //Let's handle specific key codes
            if (typeof VK_PLAY==='undefined'){
              VK_PLAY=116;
              VK_PAUSE=130;
              VK_STOP=117;
            }
            
            //console.warn('keydown', e.keyCode)
            mylog(e.keyCode);
            switch (e.keyCode){
              case VK_PLAY://play
                self.app.publish('input', ['play']);
                break;
              case VK_PAUSE: //pause
                self.app.publish('input', ['pause']);
                break;
              case VK_STOP: //stop
                self.app.publish('input', ['stop']);
                break;
              case 13://enter
                self.app.publish('input', ['enter']);
                break;
              case 37://left
                self.app.publish('input', ['left']);
                break;
              case 38: //up
                self.app.publish('input', ['up']);
                break;
              case 39: //right
                self.app.publish('input', ['right']);
                break;
              case 40: //down
                self.app.publish('input', ['down']);
                break;
              case 124: //green
                break;
              case 125: //red
                break;
              case 126: //yellow
                break;
              case 127://blue
                break;
            }
          }, true);
          callback();
        }
        
      }); // /return Class()
    });// /J.define