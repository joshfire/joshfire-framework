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

Joshfire.define(['joshfire/class'], function(Class) {

  window.IS_STRESSED=false;
  var StressTest = Class(
      /**
      * @lends adapters_browser_utils_stresstest.prototype
      */
      {

        /**
        * @constructs
        * @class An automated stresstest for Joshfire apps
        * @param {J.App} app Reference to the app.
        * @param {Object} options Options hash.
        */
        __constructor: function(app, options) {
          this.app = app;
          this.options = options;

          this.interval = this.options.interval || 50;

          this.run = false;
        },

        /**
        * @function
        * @param {int}
        */
        start: function(duration) {
          this.run = true;

          this.stressOne();

          if (duration) {
            var self;
            setTimeout(function() {
              self.stop();
            }, duration);
          }
        },

        /**
        * @function
        *
        */
        stressOne: function() {

          var randomMoves = ['down', 'up', 'left', 'right', 'enter', 'play', 'pause', 'stop', 'rewind', 'forward', 'exit'];

          this.app.publish('input', [randomMoves[Math.floor(Math.random() * randomMoves.length)]]);

          if (this.run) {
            var self = this;
            setTimeout(function() {
              self.stressOne();
            }, this.interval);
          }

        },

        /**
        * @function
        *
        */
        stop: function() {
          this.run = false;
        }


      });

  /**
  * Start the automatic stresstest mode
  * @static
  * @function
  * @param {J.App} app Reference to the app.
  */
  StressTest.auto = function(app) {

    setTimeout(function() {
      var stress = new StressTest(app, {
        'interval': 200
      });
      stress.start();
      window.IS_STRESSED=true;
      document.body.insertAdjacentHTML('beforeEnd', "<div style='position:absolute;top:1em;left:1em;z-index:10000;cursor:pointer;background:red;border:1px solid white;padding:1em;' id='stresstest_stop'>STRESS TEST MODE</div>");
      document.getElementById('stresstest_stop').onclick = function() {
        if (stress.run) {
          stress.stop();
          window.IS_STRESSED=false;
          document.getElementById('stresstest_stop').style.backgroundColor='green';
        } else {
          stress.start();
          window.IS_STRESSED=true;
          document.getElementById('stresstest_stop').style.backgroundColor='red';
        }

      };

    }, 1000);
  };


  return StressTest;


});
