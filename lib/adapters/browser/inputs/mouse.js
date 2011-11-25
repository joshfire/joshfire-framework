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
              var uiElement = $(this).attr('data-josh-ui-path');
              if (uiElement) {
                if (event.button == 2) {
                  //right click
                  self.app.ui.element(uiElement).publish('input', ['rightclick', $(this).attr('data-josh-grid-id')]);
                  
                }
                else{
                  self.app.ui.element(uiElement).publish('input', ['enter', $(this).attr('data-josh-grid-id')]);
                  return true;  
                }
                
              }

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
