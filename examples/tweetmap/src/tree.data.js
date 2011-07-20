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

Joshfire.define(['joshfire/class', 'joshfire/tree.data', './app', 'joshfire/utils/datasource', 'joshfire/vendor/underscore'], function(Class,DataTree, app, DataSource,_) {

  var datasource = new DataSource();

  var getTweets = function(search, callback) {
    if (search instanceof String) {
      search = {q: search};
    }

    var defaultParams = {
      q: 'joshfire',
      rpp: 50
    };
    datasource.request({
      url: 'http://search.twitter.com/search.json',
      data: _.extend(defaultParams, search),
      dataType: 'jsonp'
    },
    function(error, tweets) {
      if (error) {
        return callback(err, null);
      }
      var res = _.map(tweets.results, function(tw) {
        return {
          id: tw.id_str,
          label: tw.from_user + ':' + tw.text,
          image: tw.profile_image_url,
          lat: tw.geo && tw.geo.coordinates ? tw.geo.coordinates[0] : null,
          lng: tw.geo && tw.geo.coordinates ? tw.geo.coordinates[1] : null,
          location: tw.location
        };
      });
      return callback(null, res);
    });
  }

  return Class(DataTree, {
    buildTree: function() {
      return [
        {
          id: 'tweets',
          children: function(query,callback) {
            getTweets({q: window.location.hash || 'foursquare', rpp: 50, geocode: '48.8686687,2.334329499,100km'} , callback);
          }
        }
      ];
    }
  });
});
