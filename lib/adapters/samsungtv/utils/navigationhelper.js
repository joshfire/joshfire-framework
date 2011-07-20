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

Joshfire.define(
    ['joshfire/class', 'joshfire/vendor/jquery', 'joshfire/vendor/underscore', 'joshfire/mixins/pubsub'],
    function(Class, $, _, PubSub) {
  	/**
   * To have the Samsung TV behave almost like a browser with the forms, run the autoDiscoverForms(oContainer) method.
   * Remember to run reset() when the form is reloaded or disappear
   * @class Utility class for managing the focus in the forms and displaying the Samsung virtual keyboard when needed
   * @name adapters_samsungtv_utils_navigationhelper
   * @static
   * @example
   * Joshfire.define(
   *   ['joshfire/adapters/samsungtv/utils/navigationhelper'],
   *   function(NavigationHelper) {
   *   // ask the NavigationHelper utility to search in the DOM the input elements
   *   NavigationHelper.autoDiscoverForms();
   *   // enable up and down keys to go from one textfield to another
   *   NavigationHelper.listenToNavigation();
   *   // autofocus on the first element
   *   NavigationHelper.focus(0);
   *   // events fired when the visibility of the Samsung virtual keyboard changes
   *   // in order to update the UI accordingly
   *   NavigationHelper.subscribe('virtualkeyboard', function(name, event) {
   * 	  if(event === 'show') {
   * 	  // move the form to the left
   *   	} else if(event === 'hide') {
   *   		// center the form
   *   	}
   *   });
   *   // when the form disappears, you should run this method
   *   NavigationHelper.reset();
   *   }
   * );
   */
      var self = Class( /** @lends adapters_samsungtv_utils_navigationhelper.prototype */ {
        /**
        * @private
        * keep track of the order of the elements
        */
  		aNavigationList: [],
  		/** internal pointer */
    iInternalID: 0,
    /**
    * @static
    * those field types trigger the virtual keyboard display
    */
  		aVirtualKeyboardType: ['text', 'email', 'url', 'password', 'number', 'search', 'date', 'month', 'week', 'time', 'datetime', 'datetime-local'],
  		/** @public */
    bIsOpened: false,
    
    init: function() {
    
    // check dependancies
    if (!window.samsungJoshfire
    || !window.samsungJoshfire.oKeys
    || !window.samsungJoshfire.widgetAPI) {
    throw new TypeError('navigationHelperSamsung23 : samsungJoshfire is absent');
    }
    // The Samsung virtual keyboard
    // include it in index.html with <script type='text/javascript' language='javascript' src='$MANAGER_WIDGET/Common/IME/ime2.js'></script>
    if (!IMEShell) {
    throw new TypeError('Samsung virtual keyboard is absent');
    }
    
    },
    /**
    * run to add the fields to the focus list. By default, it runs on the document.body
    * @param [container=document.body] {string|DOMElement} When you display a form, run this method for the focus to be managed and the virtual keyboard to be displayed.
    */
    	autoDiscoverForms: function(container ) {
    		if (typeof container === 'string')
    			container = document.getElementById(container);
    		if (!container)
    			container = document.body;
    		var aFields = container.getElementsByTagName('input');

    		console.log('found ' + aFields.length + ' items');

    		var hasAutofocus = false;
  			for (var i = 0, iLength = aFields.length; i < iLength; i++) {
  				if (aFields[i].type != 'hidden') {
  					self.aNavigationList.push(aFields[i]);
  					if (aFields[i].getAttribute('autofocus') !== null) {
  						hasAutofocus = i;
  					}
  				}
  			}

  			var aFrames = container.getElementsByTagName('iframe');
  			console.log('autoDiscoverForms found ' + aFrames.length + ' frames');
  			for (var i = 0, iLength = aFrames.length; i < iLength; i++) {
  				self.listenToNavigation(aFrames[i].contentDocument);
  				self.autoDiscoverForms(aFrames[i].contentDocument);
  			}

  			if (hasAutofocus !== false)
  				self.focus(hasAutofocus);
  		},
  		/**
    * @static
    * @param iPosition {integer} focus on an item in the input list, adds and removes the .focus class, manage the keyboard depending on the input type.
    */
  		focus: function(iPosition ) {
  			alert('navigationhelper.focus on ' + iPosition);
  			if (!self.aNavigationList[iPosition]) {
  				console.warn('navigationhelper.focus: ' + iPosition + ' does not exist');
  				return false;
  			}
  			console.log('navigationhelper.focus on ' + self.aNavigationList[iPosition].id + ' of type ' + self.aNavigationList[iPosition].type);
  			$(self.aNavigationList[self.iInternalID]).removeClass('focus');
  			//self.aNavigationList[self.iInternalID].className = '';

  			self.iInternalID = iPosition;
  			_removeFakeInput();
  			self.checkAndAddKeyboard(self.aNavigationList[self.iInternalID]);
  			if (self.bIsOpened === true)
  			  _bFireCloseEvent = false;
  			// prevent the blur of the previous field to fire the close event, as we're just reopening another IME and that it should not be perceived by the user
  			self.aNavigationList[self.iInternalID].focus();
  			_bFireCloseEvent = true;
  			//self.moveTo(685, 80);
  		},
  		/**
    * @static
    * shortcut method
    */
  		focusNext: function() {
  			if (self.iInternalID < self.aNavigationList.length) {
  			  // skip the fields that are hidden by CSS
  			  if (self.aNavigationList[self.iInternalID]
    			    && $(self.aNavigationList[self.iInternalID + 1]).is(':hidden')) {
    			    self.iInternalID++;
    			    return self.focusNext();
    			}
  				return self.focus(self.iInternalID + 1);
  			}

  			console.log('focusNext not possible');
  			return false;
  		},
  		/**
    * @static
    * shortcut method
    */
  		focusPrevious: function() {
  			if (self.iInternalID > 0) {
  			  if (self.aNavigationList[self.iInternalID]
    			    && $(self.aNavigationList[self.iInternalID - 1]).is(':hidden')) {
    			    self.iInternalID--;
    			    return self.focusPrevious();
    			}
  				return self.focus(self.iInternalID - 1);
  			}
  			console.log('focusPrevious not possible');
  			return false;
  		},
  		/**
    * @static
    * useful to run when iframes are reloaded or objects are destroyed
    * @param oDocument {document} the document where the form was.
    */
  		reset: function(oDocument) {
  			self.aNavigationList = [];
  			self.iInternalID = 0;
  			_removeFakeInput();
  			if (oDocument)
  				oDocument.removeEventListener('keydown', _onKeyDown, false);
  		},
  		/**
    * @static
    * hides the Samsung virtual keyboard
    * @return boolean.
    */
  		close: function() {
  			alert('navigationhelper.close');
  			// there is no close function on the Samsung virtual keyboard, Samsung recommends to focus() on another element
  			/*if(self.oStealFocus) {
     self.oStealFocus.focus();
     }
     */
  			if (self.aNavigationList[self.iInternalID]) {
  				self.aNavigationList[self.iInternalID].blur();
  				return true;
  			} else {
  				return false;
  			}
  		},
  		/**
    * @static
    * checks that a given field has a type where the keyboard is needed and displays it
    * @param oInput {HTMLInputElement}
    */
  		checkAndAddKeyboard: function(oInput ) {
  			for (var i in self.aVirtualKeyboardType) {
  				if (self.aVirtualKeyboardType[i] === oInput.type) {
  					alert('navigationhelper.checkAndAddKeyboard : create IME for ' + oInput.id);

  					//_createStealFocus();

  					// properly destroy before re-creating a new IME
  					// that method exists only from version IME-0002
  					if (_samsungKeyboard
  					    && _samsungKeyboard.DeInitIME)
  					    _samsungKeyboard.DeInitIME();

  					// in the current DOM, no trick,
  					if (oInput.ownerDocument === document) {
  						_samsungKeyboard = new IMEShell(oInput.id, function() {
  							console.log('IME created');
  							self.bIsOpened = true;
  							// advert that the keyboard is here
      					this.publish('virtualkeyboard', 'show');
  						});

  					} else {
  						var oFakeInput = _getFakeInput(oInput);
  						_samsungKeyboard = new IMEShell(oFakeInput.id, function() {
  							alert('navigationhelper.checkAndAddKeyboard IME created with fake input ' + oInput.className);
  							// replace by DOM.addClass('focus')
  							$(oInput).addClass('focus');
  							//oInput.className += ' focus';
  							oFakeInput.focus();
  						});
  						oFakeInput.addEventListener('keydown', function(e) {
  							alert('fakeInput received ' + e.keyCode);
  							oInput.value = this.value;
  							return true;
  						}, false);
  					}
  					// if you execute that method, the .moveTo method wont work anymore
  					// _samsungKeyboard.setString( oInput.value );

  					// this method does not exist in the emulator
  					if (_samsungKeyboard.SetIMEInputMode) {
      					if (oInput.type === 'number') {
      					    // MODE_MENU=1, MODE_HELP=2, MODE_SYMBOL=3, MODE_123=4, MODE_ABC=5, MODE_T9=
      					    _samsungKeyboard.SetIMEInputMode(4);
      					} else if (oInput.type === 'email'
      					            && oInput.value != '') {
      					    oInput.value = '@';
      					    _samsungKeyboard.SetIMEInputMode(5);
      					} else if (oInput.type === 'url'
      					            && oInput.value != '') {
      					    oInput.value = 'http://www.';
      					    _samsungKeyboard.SetIMEInputMode(5);
      					} else {
      					    _samsungKeyboard.SetIMEInputMode(5);
      				  }
  					}
  					// default to absolute right
  					self.moveTo(685, 80);

  					// the keyboard disappears when associated input dont have the focus anymore
  					var onBlur = function() {
  					  console.log('navigationhelper.checkAndAddKeyboard BLUR', _bFireCloseEvent, self.bIsOpened);
  					  if (_bFireCloseEvent === true) {
    					  window._app.publish('virtualkeyboard', 'hide');
  				    }
  				    oInput.removeEventListener('blur', onBlur, false);
  				    self.bIsOpened = false;
  				  };
  					oInput.addEventListener('blur', onBlur, false);

  					return;
  				}
  			}
  			// the IME has not been displayed
          self.bIsOpened = false;
  		},
  		/**
    * @private
    * modify default behaviour of the Samsung virtual keyboard :
    * up and down keys must still continue to focus on next and previous fields
    * return and exit buttons must not quit the application
    */
  		SamsungKeyboardManageSpecialKeys: function() {
  			_samsungKeyboard.setKeyFunc(samsungJoshfire.oKeys.KEY_UP, function() {
  				self.focusPrevious();
  				return false;
  			});
  			_samsungKeyboard.setKeyFunc(samsungJoshfire.oKeys.KEY_DOWN, function() {
  				//alert(' key down');
  				self.focusNext();
  				return false;
  			});
  			_samsungKeyboard.setKeyFunc(samsungJoshfire.oKeys.KEY_RETURN, function() {
  				samsungJoshfire.widgetAPI.blockNavigation();
  				return false;
  			});
  			_samsungKeyboard.setKeyFunc(samsungJoshfire.oKeys.KEY_EXIT, function() {
  				samsungJoshfire.widgetAPI.blockNavigation();
  				return false;
  			});

  		},
  		/**
    * for a given document, listen to the arrow keys and manages the focus
    * @param a pointer to the DOM object of document element, wether from the current window or in an iframe.
    */
  		listenToNavigation: function(oDocumentElement) {
  			if (!oDocumentElement) {
  				oDocumentElement = document;
  			}

  			// use the already existing listener
  			/*if(oDocumentElement === document) {
     console.log( 'subscribe to global keydown listener');
     _app.subscribe('input', function(ev, data) {
     console.log( 'navigation helper received input '+data);
     if(data == 'left'
     || data == 'up') {
     self.focusPrevious();
     } else if(data == 'right'
     || data == 'down') {
     self.focusNext();
     }
     });
     } else {*/
  			oDocumentElement.addEventListener('keydown', _onKeyDown, false);
  			//}
  		//}
  	  },
    	/**
     * @static
     * @param iX {integer} horizontal position of the top left corner.
     * @param iY {integer} vertical position of the top left corner.
     * @param [iZindex=99] {integer} : the z-index of the virtual keyboard.
     */
    	moveTo: function(iX, iY, iZindex) {
    		if (!_.isNumber(iX) || !_.isNumber(iY))
    			throw new TypeError('moveTo(): X or Y is not a number');
    		// apps have a 960 width resolution, keyboard width is 275
    		iX = Math.min(685, iX);
    		iY = Math.min(160, iY);

    		if (!_.isNumber(iZindex)) {
    			iZindex = 99;
    		}
    		// Maple browser dos not support z-index above 99
    		iZindex = Math.min(99, iZindex);
    		console.log('will position to ' + iX + ', ' + iY + ' with z-index to ' + iZindex);
    		_samsungKeyboard.setKeypadPos(iX, iY, iZindex);
    		_samsungKeyboard.setWordBoxPos(iX, iY, iZindex);
    	}

      });
      // add the publish and subscribe method
      self = PubSub.mixin(self.prototype);

      // private
      var _samsungKeyboard = null,
		  _sFakeInputId = 'fake-input',
		  _sFocusSteal = 'focus-steal', // synchronize this id with the stylesheet in order to hide it
		  _bFireCloseEvent = true,
          /**
          * @private
          * create a link that is used to close the virtual keyboard when focusing on it
          */
  	  _createStealFocus = function() {
    	  if (self.oStealFocus) {
    	    return self.oStealFocus;
            }

    		var stealFocus = document.createElement('a');
    		stealFocus.id = _sFocusSteal;
    		stealFocus.innerHTML = 'should not see me';
    		document.appendChild(stealFocus);
    		return self.oStealFocus = document.getElementById(_sFocusSteal);
          },
          /**
          * @private
          */
          _onKeyDown = function(e) {
    		console.log('navigationhelper.keydown ' + e.keyCode);

    		switch (e.keyCode) {
    			case samsungJoshfire.oKeys.KEY_LEFT:
    			case samsungJoshfire.oKeys.KEY_UP:
    				//alert('go previous');
    				self.focusPrevious();
    				break;
    			case samsungJoshfire.oKeys.KEY_RIGHT:
    			case samsungJoshfire.oKeys.KEY_DOWN:
    				//alert('go next');
    				self.focusNext();
    				break;
    			default :
    				break;
  		  }
  		  return false;
  	  },
          /**
          * @private
          */
  	  _removeFakeInput = function() {
  			var oEl = document.getElementById(_sFakeInputId);
  			if (oEl) {
  				oEl.blur();
  				document.body.removeChild(oEl);
  			}
  		},
  		/*
    * @private
    * retrieve or make the invisible input used to receive the keyboard keys
    */
  		_getFakeInput = function(oInput ) {
  			var oEl = document.getElementById(_sFakeInputId);
  			if (oEl) {
  				oEl.type = oInput.type;
  				oEl.maxlength = oInput.maxlength;
  				return oEl;
  			}
  			oEl = document.createElement('input');
  			oEl.id = _sFakeInputId;
  			oEl.type = oInput.type;
  			oEl.maxlength = oInput.maxlength;
  			document.body.appendChild(oEl);
  			return oEl;
  		};


      return self;

    });// end closure and define
