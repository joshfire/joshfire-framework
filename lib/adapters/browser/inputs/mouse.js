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

Joshfire.define(['joshfire/input', 'joshfire/class', 'joshfire/vendor/jquery'], function(Input, Class, $) {

  /**
  * @class Input interface for keyboards
  * @name adapters_browser_inputs_mouse
  * @augments input
  */
  return Class(Input,
      /**
      * @lends adapters_browser_inputs_mouse.prototype
      */
      {

        /**
        * @function
        */
        setup: function(callback) {
          var self = this;


          self.app.subscribe('afterInsert', function() {

            $('.joshover', self.app.baseHtmlEl).live('mousedown', function(event) {

              //        console.log('click', this, event);

	      if (event.button != 2) { // Ignore right click event for select
		var uiElement = $(this).attr('data-josh-ui-path');
		if (uiElement) {
                  self.app.ui.element(uiElement).publish('input', ['enter', $(this).attr('data-josh-grid-id')]);
                  return false;
		}
	      }

              /* else {
              var menuPath = $(this).attr('data-path');
              console.log("click", menuPath);
              if (menuPath) {
              self.app.tree.moveTo("focus",menuPath);
              }
              
              setTimeout(function() {
              
              //If we didn't auto-child
              console.log("autochild?", self.app.tree.getState("focus"), menuPath);
              
              if (self.app.tree.getState("focus") == menuPath || !menuPath) {
              self.app.publish("input", ["enter"]);
              //,menuPath || event.currentTarget.id]);
              }
              }, 100);
              }*/

            });


            $('.joshover', self.app.baseHtmlEl).live('mouseenter', function(event) {

              var uiElement = $(this).attr('data-josh-ui-path');
              if (uiElement) {
                var uiElement = self.app.ui.element(uiElement);
                if (uiElement && !uiElement.options.noMouseAutoFocus)
                  uiElement.publish('input', ['hover', $(this).attr('data-josh-grid-id')]);
              }
              /* else {
              
              var menuPath = $(this).attr('data-path') || event.currentTarget.id;
              self.app.publish("input", ["hover", menuPath]);
              
              }*/

              return false;
            });


            $('.joshover', self.app.baseHtmlEl).live('mouseleave', function(event) {

              var uiElement = $(this).attr('data-josh-ui-path');
              if (uiElement) {
                var uiElement = self.app.ui.element(uiElement);
                if (uiElement && !uiElement.options.noMouseAutoFocus)
                  uiElement.publish('input', ['leave', $(this).attr('data-josh-grid-id')]);
              }
              /* else {
              
              var menuPath = $(this).attr('data-path') || event.currentTarget.id;
              self.app.publish("input", ["hover", menuPath]);
              
              }*/

              return false;
            });


          });

          callback(null);
        }

      });


});
