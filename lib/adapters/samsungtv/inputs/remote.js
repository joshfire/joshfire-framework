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

 define([], function(){
 	return{};
 })
/*
Joshfire.define(['joshfire/input', 'joshfire/class', 'joshfire/vendor/json2'],
    function(Input, Class) {
      return Class(Input, {
        setup: function(callbackOnReady) {
          var self = this;
		// The Samsung SDK provides this API to get the key numbers
		// for debugging, we
		if (window.samsungJoshfire && window.samsungJoshfire.oKeys) {
			var oKeys = samsungJoshfire.oKeys;

			// the onShow event is specific to Samsung and is called after the onload event
			// it is not standard so it can not use addEventListener
	
			window.onShow = function() {
			    // let the standard TV keys manage the sound volume
				if (samsungJoshfire.TVNavigationAPI) {
				    //&& samsungJoshfire.TVNavigationAPI.SetBannerState) {
				    samsungJoshfire.TVNavigationAPI.SetBannerState(1);
			    } else {
			        console.warn('NO NAV API PRESENT');
		        }

				samsungJoshfire.pluginAPI.unregistKey(oKeys.KEY_VOL_UP);
				samsungJoshfire.pluginAPI.unregistKey(oKeys.KEY_VOL_DOWN);
				samsungJoshfire.pluginAPI.unregistKey(oKeys.KEY_MUTE);

				// to pass Samsung validation process, disable some keys :
				samsungJoshfire.pluginAPI.unregistKey(oKeys.KEY_CONTENT);//INTERNET
				samsungJoshfire.pluginAPI.unregistKey(oKeys.KEY_SOURCE);
				samsungJoshfire.pluginAPI.unregistKey(oKeys.KEY_MENU);

			};
		} else {
			console.warn('remotesamsung23 : you are not on a Samsung environment or samsungJoshfire is missing');
			// faking the keys, binding them to the regular keyboad, for debug
			oKeys = {
				KEY_ENTER: 13,
				KEY_LEFT: 37,
				KEY_RIGHT: 39,
				KEY_UP: 91,
				KEY_WHEELUP: 91,
				KEY_DOWN: 40,
				KEY_WHEELDOWN: 40
			};
		}
		console.log('input class remoteSamsung23', JSON.stringify(oKeys));

          document.addEventListener('keydown',
		function(e) {
                if (!e) e = window.event;
                console.log('keydown :' + e.keyCode);
			$(window._app.baseHtml).trigger('joshactivity');
			var sKey = null;
			// for debugging with Chrome, keyboard codes are maintained (the numbers)
                switch (e.keyCode) {
				case oKeys.KEY_ENTER:
					sKey = 'enter';
                    break;
				case oKeys.KEY_LEFT:
					sKey = 'left';
                    break;
				case oKeys.KEY_RIGHT:
					sKey = 'right';
                    break;
				case oKeys.KEY_UP:
				case oKeys.KEY_WHEELUP:
					sKey = 'up';
                    break;
				case oKeys.KEY_DOWN:
				case oKeys.KEY_WHEELDOWN:
					sKey = 'down';
                    break;
				case oKeys.KEY_EXIT:
				case oKeys.KEY_RETURN:
					// Exit and Return buttons get back to the Smart Hub screen or to the TV
					// with this method, we could disable this behaviour
					//samsungJoshfire.widgetAPI.blockNavigation();
					sKey = 'exit';
                    break;
                  case 179:
				case oKeys.KEY_PLAY:
					sKey = 'play';
                    break;
				case oKeys.KEY_PAUSE:
					sKey = 'pause';
                    break;
                  case 178:
				case oKeys.KEY_STOP:
					sKey = 'stop';
                    break;
                  case 176:
				case oKeys.KEY_FF:
					sKey = 'forward';
                    break;
                  case 177:
				case oKeys.KEY_RW:
					sKey = 'rewind';
                    break;
			}

			if (sKey === null)
				return true;

			// intercept the keys when the colorbox is displayed
			if (!self.app.colorBoxDisplayed
				|| sKey === 'pause'
				|| sKey === 'stop'
				|| sKey === 'play'
				|| sKey === 'exit') {
					self.app.publish('input', [sKey]);
			} else {
				return true;
			}
			return true;
              }, false);


          callbackOnReady(null);
        }
      });
    });*/
