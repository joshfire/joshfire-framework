/*!
 * Joshfire Framework 0.9.1
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jul 20 19:18:46 2011
 */


/*!
* Joshfire Framework 0.9.0
* http://framework.joshfire.com/
*
* Copyright 2011, Joshfire
* Dual licensed under the GPL Version 2 and a Commercial license.
* http://framework.joshfire.com/license
*
* Date: Wed Jun 29 16:25:37 2011
*/


Joshfire.define(['joshfire/class'], function(Class) {

  return Class(
      /**
      * @lends utils_geolocation.prototype
      */
      {

        /**
        * @constructs
        * @class A Geolocation implementation // IP localization based on YQL-Geo / HTML5 navigator.geolocation
        */
        __constructor: function(options) {

          this.ip_geoloc_service_url = 'http://j.maxmind.com/app/geoip.js';
        },

        /**
        * @function
        * @param {boolean}
        * @param Object (var).
        * @param Object (params).
        */
        getPosition: function(success, error, params) {
          /* default parameters
          high accurracy : not needed in most cases
          max age : 24 hours (2*3600*1000)
          timeout : warning: timeout on localization, not on user response.
          */
          var default_params = {
            firstAnswerOnly: true,
            enableHighAccuracy: false,
            maximumAge: 86400000,
            timeout: 5000
          },
              self = this,
              answered = false,
              timeout_user_answer = 3000;
          if (navigator && navigator.geolocation) {
            //HTML5 navigator.geolocation
            navigator.geolocation.getCurrentPosition(

                function(response) {
                  if (params.firstAnswerOnly && answered) {
                    return;
                  }
                  answered = true;
                  return success(response);
                }, function(err_api) {
                  if (params.firstAnswerOnly && answered) {
                    return;
                  }
                  var msg;
                  switch (err_api.code) {
                    case err_api.PERMISSION_DENIED:
                      msg = 'User denied geolocation';
                      break;
                    case err_api.POSITION_UNAVAILABLE:
                      msg = 'User position is unavailable';
                      break;
                    case err_api.TIMEOUT:
                      msg = 'Timeout';
                      break;
                    default:
                      msg = 'Unknown error' + err_api.message ? ' - ' + err_api.message : '';
                      break;
                  }
                  //console.error(err_api.code, msg)
                  //error({code:err_api.code, message:msg});
                  self.getPositionByIP(success, error, params);
                  answered = true;
                  return false;
                }, _.extend(default_params, params));
            setTimeout(function() {
              if (!answered) {
                self.getPositionByIP(success, error, params);
              }
            }, timeout_user_answer);
          } else {
            self.getPositionByIP(success, error, params);
          }
        },
        /**
        * @function
        * @param {boolean}
        * @param Object (var).
        * @param Object (params).
        */
        getPositionByIP: function(success, error, params) {
          //Use http://isithackday.com/hacks/geo/yql-geo-library/
          var self = this;

          // J.getScript(this.ip_geoloc_service_url ,
          $.ajax({
            url: self.ip_geoloc_service_url,
            dataType: 'script',
            cache: true,
            //if !cache, jquery appends ?_random to the url, which throws a 404 on maxmind.com
            success: function() {
              success.call(this, {
                // reproduce Position object signature
                coords: {
                  latitude: geoip_latitude(),
                  longitude: geoip_longitude()
                }
              });
            },
            error: error
          });
        },

        /**
        * @function
        *
        */
        watchPosition: function() {


        }
      });
});
