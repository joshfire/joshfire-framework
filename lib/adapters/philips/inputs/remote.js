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
          mylog:function(txt){
             if (document.getElementById('log')){
               document.getElementById('log').innerHTML = txt+'<br />'+document.getElementById('log').innerHTML;
             }
             else{
              console.warn(txt);
             }
          },
          
         keyCodeToInputEvent: function() {
           //debugging in a browser ?
           //Let's handle specific key codes
           if (typeof VK_PLAY==='undefined'){
             VK_PLAY=415;//emulator: 116, tv 415 ?
             VK_PAUSE=19;//emulator: 130, tv 19
             VK_STOP=413//emulator 117, tv 413;
           }
            return {
              VK_PLAY: 'play',
              VK_PAUSE: 'pause',
              VK_STOP: 'stop',
              VK_BACK:'exit',
              VK_UP:'up',
              VK_RIGHT:'right',
              VK_DOWN:'down',
              VK_LEFT:'left',
              VK_REWIND:'rewind',
              vk_FAST_FWD:'forward',
              VK_ENTER:'enter',
              13: 'enter',
              19:'pause',
              27: 'exit',
              32: 'enter', //space
              37: 'left',
              38: 'up',
              39: 'right',
              40: 'down',
              412:'rewind',
              413:'stop',
              415:'play',
              473:'forward',
              /* colors 
              403:'red',
              404:'green',
              502:'yellow',
              406:'blue' */
              /* emulator colors,
              124:'green',// ?
              125:'red',//?
              126:'yellow',//?
              127:'blue',//? */
            };

          },
        setup:function(callback){
          
          var self = this;
          self.mylog('INIT VK_PAUSE |'+VK_PAUSE+'|, '+typeof VK_PAUSE);
          document.addEventListener('keydown',function(e){

           var map = self.keyCodeToInputEvent(),
            strEvent = map[e.keyCode];
            
            
            self.mylog('key '+e.keyCode+' ; '+map[e.keyCode]);
            //console.warn('input', e.keyCode, strEvent)
            
            if (strEvent) {
                self.app.publish('input', [strEvent]);
            }else
            {
              self.mylog('Unknown |'+e.keyCode+'|, VK_PAUSE is |'+VK_PAUSE+'|,'+typeof e.keyCode+', '+typeof VK_PAUSE);
            }
          },true);
          callback();
        }
        
      }); // /return Class()
    });// /J.define