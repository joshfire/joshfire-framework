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
          self.mylog('VK_PLAY is '+(typeof VK_PLAY=='undefined' ? 'undefined :-(' : VK_PLAY));
          self.mylog('VK_PAUSE is '+(typeof VK_PAUSE=='undefined' ? 'undefined :-(' : VK_PAUSE));
          self.mylog('VK_STOP is '+(typeof VK_STOP=='undefined' ? 'undefined :-(' : VK_STOP));
          self.mylog('VK_ENTER is '+(typeof VK_ENTER=='undefined' ? 'undefined :-(' : VK_ENTER));
          self.mylog('VK_LEFT is '+(typeof VK_LEFT=='undefined' ? 'undefined :-(' : VK_LEFT));
          self.mylog('VK_RIGHT is '+(typeof VK_RIGHT=='undefined' ? 'undefined :-(' : VK_RIGHT));
          self.mylog('VK_UP is '+(typeof VK_UP=='undefined' ? 'undefined :-(' : VK_UP));
          self.mylog('VK_DOWN is '+(typeof VK_DOWN=='undefined' ? 'undefined :-(' : VK_DOWN));
          self.mylog('VK_BACK is '+(typeof VK_BACK=='undefined' ? 'undefined :-(' : VK_BACK));
          self.mylog('VK_FAST_FWD is '+(typeof VK_FAST_FWD=='undefined' ? 'undefined :-(' : VK_FAST_FWD));
          self.mylog('VK_REWIND is '+(typeof VK_REWIND=='undefined' ? 'undefined :-(' : VK_REWIND));
          self.mylog('VK_RED is '+(typeof VK_RED=='undefined' ? 'undefined :-(' : VK_RED));          
          self.mylog('VK_GREEN is '+(typeof VK_GREEN=='undefined' ? 'undefined :-(' : VK_GREEN));          
          self.mylog('VK_YELLOW is '+(typeof VK_YELLOW=='undefined' ? 'undefined :-(' : VK_YELLOW));          
          self.mylog('VK_BLUE is '+(typeof VK_BLUE=='undefined' ? 'undefined :-(' : VK_BLUE));          
          document.addEventListener('keydown',function(e){

           var map = self.keyCodeToInputEvent(),
            strEvent = map[e.keyCode];
            
            
            self.mylog('key '+e.keyCode+' ; '+map[e.keyCode]);
            //console.warn('input', e.keyCode, strEvent)
            if (strEvent) {
                self.app.publish('input', [strEvent]);
            }
          },true);
          callback();
        }
        
      }); // /return Class()
    });// /J.define