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
          keyCodeToInputEvent: function(keyCode) {
         
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
              case VK_RED:inputEvent='red';break;
              case VK_GREEN:inputEvent='green';break;
              case VK_YELLOW:inputEvent='easter';break;
/*              case VK_BLUE:inputEvent='';break;*/
            }
            
            return inputEvent;

          },
        setup:function(callback){
          
          var self = this;
          if (navigator && navigator.userAgent && !(navigator.userAgent.match(/Philips/i) || navigator.userAgent.match(/NETTV/i))) {
            self.simulateRemote();
          }
          
          //specific listener for vk_back
          //document.addEventListener('keypress', function(e){
            document.onkeypress = function (e){
            var strEvent = self.keyCodeToInputEvent(e.keyCode);

            if (e.keyCode==VK_BACK){
              e.preventDefault();
              self.app.publish('input', ['exit']);
//              return false;
            }
            

          }; //);
          
          document.addEventListener('keydown',function(e){
            
            var strEvent = self.keyCodeToInputEvent(e.keyCode);
            
            
//            console.warn('input', e.keyCode, strEvent)
            
            if (strEvent) {
                if (e.keyCode==VK_BACK){
                  e.preventDefault();//self.app.publish('input', [strEvent]);
                  
                //  return false;
                }
                else{
                   self.app.publish('input', [strEvent]);
                }            }
            else
            {
              //Unknown key stroke... send input event nevertheless
              self.app.publish('input', [e.keyCode]);
            }
          },true);
          callback();
        },    
        //debugging in a browser ?
        simulateRemote:function(){
//             if (typeof VK_PLAY==='undefined'){
                  VK_PLAY=415;//emulator: 116, tv 415 ?
                VK_PAUSE=19;//emulator: 130, tv 19
                VK_STOP=413;//emulator 117, tv 413;
                VK_BACK=27;
                VK_UP=38;
                VK_RIGHT=39;
                VK_DOWN=40;
                VK_LEFT=37;
                VK_REWIND=412;
                VK_FAST_FWD=473;
                VK_ENTER=13;
                VK_YELLOW=192;
                VK_RED=82; //R
                VK_GREEN=71;//G
         //    }
        }
      }); // /return Class()
    });// /J.define