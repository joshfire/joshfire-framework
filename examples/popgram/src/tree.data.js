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

Joshfire.define(['joshfire/class', 'joshfire/tree.data', './app', 'joshfire/utils/datasource', 'joshfire/vendor/underscore'], function(Class, DataTree, app, DataSource, _) {
  var datasource = new DataSource();
  var getPopularPhotos = function(callback) {
    datasource.request({
      url: 'https://api.instagram.com/v1/media/popular?client_id=630378d0d02a4c7b956c687c5b186178',
      dataType: 'jsonp'},
    function(error, photos) {
      if (error) { return callback(error, null); }
      callback(null, _.map(photos.data, function(photo) {
        return {
          id: photo.id,
          url: photo.link,
          label: '<strong>Filter:</strong> ' + photo.filter,
          image: photo.images.low_resolution.url
        };
      }));
    });
  }

  return Class(DataTree, {
    buildTree: function() {
      return [
        {
          id: 'photos',
          children: function(query, callback) {
            getPopularPhotos(callback);
          }
        }
      ];
    }
  });
});
