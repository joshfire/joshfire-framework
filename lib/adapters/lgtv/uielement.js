define(["joshlib!adapters/googletv/uielement", 'joshlib!utils/dollar'],function(GtvUIElement, $) {


	return GtvUIElement.extend({

    /**
     * Processes a key event.
     */
    processKey: function(event) {
      //if (app && app.mylog){
      //    app.mylog('uie keydown '+event.keyCode +' - '+String.fromCharCode(event.keyCode));
      //}
      switch(event.keyCode) {
        case 38:
       // event.preventDefault();
        if(this.navUp) {
          return this.navUp(event);
        }
        break;
        case 39:
        //event.preventDefault();
        if(this.navRight) {
          return this.navRight(event);
        }
        break;
        case 40:
        //event.preventDefault();
        if(this.navDown) {
          return this.navDown(event);
        }
        break;
        case 37:
        //event.preventDefault();
        if(this.navLeft) {
          return this.navLeft(event);
        }
        break;
        case 13: case 32: case window.VK_ENTER:
        if(this.navAction) {
          return this.navAction(event);
        }
        break;
      }

      if(this.origin) {
        switch(event.keyCode) {
          case 38: case 39: case 40: case 37: case 13: case 32:
          return this.origin.processKey(event);
          break;
        }
      }

      return true;
    },
    /* bind an event
	    * @function
	    * @param {String} eventName
	    * @param {Function} handler
	    * @param {object} context option. Defaults to document
	    **/
	    on:function(eventName, handler, context){
	      $(context || document).bind(eventName,handler);
	    },
	    /* unbind an event
	    * @function
	    * @param {String} eventName
	    * @param {Function} handler
	    * @param {object} context option. Defaults to document
	    **/
	    off:function(eventName, handler, context){
	      $(context || document).unbind(eventName,handler);
	    },
	});
});
