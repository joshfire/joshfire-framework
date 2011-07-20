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

Joshfire.define(['../../../utils/datasource', 'joshfire/class'], function(DataSource, Class, $) {

  var request = Joshfire.nodeRequire('request');

  return Class(DataSource, {

    /**
    * @function
    * @param {Object} params
    */
    _request: function(params, callback) {

      //convert $.ajax-style params to a request-like array
      var rq = {
        method: params.type,
        uri: params.url
      };

      if (params.data) {
        rq.body = params.data; //serialize?
        rq.headers = {
          'Content-Type': 'application/x-www-form-urlencoded'
        };
      } else {
        rq.headers = {
          'Content-Length': '0'
        };
      }

      request(rq, function(error, response, body) {
        if (error) {
          return callback(error);
        }

        if (params.dataType == 'json' || params.dataType == 'text json' || params.dataType == 'jsonp') {
          var tmp_json;

          try {
            tmp_json = JSON.parse(body);
          } catch (e) {
            console.warn('Invalid JSON : ', body);
            return callback(e);
          }
          try {
            params.callback(null, tmp_json);
          } catch (e) {
            return callback(e);

          }


        } else {
          callback(null, body);
        }



      });

      return true;
    }

  });


});
