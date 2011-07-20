/*!
 * Joshfire Framework 0.9.1
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jul 20 19:23:09 2011
 */


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


Joshfire.define(['../../../utils/datasource', 'joshfire/class', 'joshfire/vendor/zepto', 'joshfire/vendor/underscore'], function(DataSource, Class, $,_) {

  return Class(DataSource, {

    /**
    * @function
    * @param {Object} var
    */
    _request: function(params, callback) {

      if (params.dataType == 'jsonp') {
        // params.dataType='json';

        if (!params.url.match(/\?.*=/)) {
          params.url += '?callback=?';
        }
        else {
          params.url += '&callback=?&';
        }
        _.each(params.data, function(val,key) {
          params.url += '&' + key + '=' + val;
        });
      }

      params.success = function(ret, code) {
        callback(null, ret);
      };

      params.error = function(err) {
        callback(err);
      };

      return $.ajax(params);
    }

  });


});
