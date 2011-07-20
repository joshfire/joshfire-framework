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

Joshfire.define(['../../../utils/datasource', 'joshfire/class', 'joshfire/vendor/jquery'], function(DataSource, Class, $) {

  return Class(DataSource, {

    _request: function(params, callback) {


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
