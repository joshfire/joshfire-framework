define([
  'joshlib!vendor/backbone',
  'joshlib!utils/woodman'
],
function (
  Backbone,
  woodman
) {
  var logger = woodman.getLogger('router');

  var router = Backbone.Router.extend({
    routes : {
      '' : 'home',
      'google': 'google',
      'bing' : 'bing',
      'osm' : 'osm'
    },
    initialize : function initialize(options) {
      logger.log('Initializing');
      _.extend(this, options);
      Backbone.Router.prototype.initialize.call(this);
    },
    start : function start() {
      Backbone.history.start();
      
    },
    home : function home() {
    	this.navigate('/google', {trigger:true});
    },
    google: function google() {
      logger.log('google');
      this.app.showMap('google', {data:[{lat:48, lng:2}], refreshMarkers:true});
    },
    bing: function bing() {
      logger.log('bing');
      this.app.showMap('bing', {});
    },
    osm: function osm() {
      logger.log('osm');
      this.app.showMap('osm', {mapType:'default'});
    }
  });
  return router;
});