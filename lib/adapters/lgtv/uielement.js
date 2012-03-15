define(["joshlib!adapters/googletv/uielement"],function(GtvUIElement) {
	
	
	return GtvUIElement.extend({
		/* Listen to an event
	    * @function
	    * @param {String} eventName
	    * @param {Function} handler
	    **/
	    listen:function(eventName, handler){
	      $.bind(eventName,handler);
	    },	
	});
});