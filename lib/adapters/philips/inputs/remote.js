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
          
         keyCodeToInputEvent: function(keyCode) {
           //debugging in a browser ?
           if (typeof VK_PLAY==='undefined'){
             var VK_PLAY=415;//emulator: 116, tv 415 ?
             var VK_PAUSE=19;//emulator: 130, tv 19
             var VK_STOP=413;//emulator 117, tv 413;
             var VK_BACK=27;
             var VK_UP=38;
             var VK_RIGHT=39;
             var VK_DOWN=40;
             var VK_LEFT=37;
             var VK_REWIND=412;
             var VK_FAST_FWD=473;
             var VK_ENTER=13;
           }
           var inputEvent=null;
            switch(keyCode){
              case VK_PLAY:inputEvent='play';break;
              case VK_PAUSE:inputEvent='pause';break;
              case VK_STOP:inputEvent='stop';break;
              case VK_BACK:inputEvent='exit';break;
              case VK_UP:inputEvent='up';break;
              case VK_RIGHT:inputEvent='right';break;
              case VK_DOWN:inputEvent='down';break;
              case VK_LEFT:inputEvent='left';break;
              case VK_REWIND:inputEvent='rewind';break;
              case VK_FAST_FWD:inputEvent='forward';break;
              case VK_ENTER:inputEvent='enter';break;
/*              case:VK_RED:inputEvent='';break;
              case:VK_GREEN:inputEvent='';break;
              case:VK_YELLOW:inputEvent='';break;
              case:VK_BLUE:inputEvent='';break;*/
            }
            
            return inputEvent;

          },
        setup:function(callback){
          
          var self = this;
          
          //specific listener for vk_back
          document.addEventListener('keypress', function(e){
            var strEvent = self.keyCodeToInputEvent(e.keyCode);
            if (strEvent==='exit'){
              e.preventDefault();
              self.app.publish('input', [strEvent]);
            }

          });
          
          document.addEventListener('keydown',function(e){

            var strEvent = self.keyCodeToInputEvent(e.keyCode);
            self.mylog('key '+e.keyCode+' ; '+strEvent);
            //console.warn('input', e.keyCode, strEvent)
            
            if (strEvent) {
                if (strEvent!=='exit'){
                  self.app.publish('input', [strEvent]);
                }
            }else
            {
              self.mylog('Unknown '+e.keyCode);
            }
          },true);
          callback();
        }
        
      }); // /return Class()
    });// /J.define