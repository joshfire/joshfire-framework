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

Joshfire.define(['joshfire/class', 'joshfire/adapters/browser/app', 'joshfire/main', 'joshfire/vendor/underscore', 'joshfire/vendor/json2', 'joshfire/inputs/remote'] ,
    function(Class, App, J, _, JSON, Remote) {

      return Class(App, {

        getDefaultOptions: function() {

          // keyboard is here only for debug purpose, when in a regular browser without remote control.
          // Disable when exporting to the TV, as some keys number overlap
          if (!window.samsungJoshfire) {
            var inputs = ['keyboard'];
          } else {
            var inputs = [Remote];
          }

          // simply overwrite the parent
          var options = _.extend(this.__super(), {
            inputs: inputs,
            autoInsert: true
          });

          //alert(options.parentElement
          return options;
        },
        // by default, when the app is inserted, send a message to Samsung Smart Hub to say him he can display the UI
        insert: function(htmlId) {
          this.__super(htmlId);
          if (samsungJoshfire.widgetAPI)
            samsungJoshfire.widgetAPI.sendReadyEvent();
        }
      });// end return Class
    });// end closure and define
