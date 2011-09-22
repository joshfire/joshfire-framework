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

Joshfire.define(['joshfire/class', 'joshfire/utils/getscript', 'joshfire/vendor/underscore'], function(Class, getScript,_) {
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
        getPosition: function(params, callback) {
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
              
          params = _.extend({}, default_params,params);
          
          if (navigator && navigator.geolocation) {
            //HTML5 navigator.geolocation
            navigator.geolocation.getCurrentPosition(
                function(response) {
                  if (params.firstAnswerOnly && answered) {
                    return true;
                  }
                  answered = true;
                  return callback(null, response);
                }, function(err_api) {
                  if (params.firstAnswerOnly && answered) {
                    return true;
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
                  self.getPositionByIP(params, callback);
                  answered = true;
                  return false;
                }, _.extend(default_params, params));
            setTimeout(function() {
              if (!answered) {
                self.getPositionByIP(params, callback);
              }
            }, timeout_user_answer);
          } else {
            self.getPositionByIP(params, callback);
          }
        },
        /**
        * @function
        * @param {boolean}
        * @param Object (var).
        * @param Object (params).
        */
        getPositionByIP: function(params, callback) {
          //Use http://isithackday.com/hacks/geo/yql-geo-library/
          var self = this;

          getScript(this.ip_geoloc_service_url ,
            function (){
              callback.call(self, null, {
                // reproduce Position object signature
                coords: {
                  latitude: geoip_latitude(),
                  longitude: geoip_longitude()
                }
              });
            }
           );
        },

        /**
        * @function
        *
        */
        watchPosition: function() {


        }
      });
});
