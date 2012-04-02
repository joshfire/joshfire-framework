define(["joshlib!adapters/googletv/uielement", 'joshlib!utils/dollar'],function(GtvUIElement, $) {
  
  
  return GtvUIElement.extend({
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