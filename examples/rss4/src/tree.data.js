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

Joshfire.define(['joshfire/class', 'joshfire/tree.data', 'joshfire/vendor/underscore', 'joshfire/utils/datasource'], function(Class, DataTree, _, Datasource) {
  var datasource = new Datasource(); // wrapper for ajax requests
  var rssToJson = function(rssUrl, callback) {
    datasource.request({
      url: 'http://pipes.yahoo.com/pipes/pipe.run?_id=4fa74022e5e07885dc8ec7fe498d34a4&_render=json&url=' + escape(rssUrl) + '&_callback=?',
      dataType: 'jsonp'
    },
    function(error, news) {
      if (error) { return callback(error, null); }
      callback(null, _.map(news.value.items, function(item,id) {
        return _.extend(item, { id: id, thumbnail: item.image, image: item.image.substr(0, item.image.length - 6) });
      }));
    });
  };

  return Class(DataTree, {
    buildTree: function() {
      return [
        {
          id: 'news',
          children: function(query,callback) {
            rssToJson('http://newsfeed.time.com/feed/', callback);
          }
        }
      ];
    }
  });
});
