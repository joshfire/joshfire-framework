define([
  'joshlib!vendor/backbone',
  'joshlib!vendor/underscore',
  'joshlib!utils/dollar',

  'joshlib!ui/map',
  'joshlib!ui/list',

  'router',

  'joshlib!utils/woodman'
], function (
  Backbone,
  _,
  $,

  Map,
  List,

  Router,

  woodman
) {

  var logger = woodman.getLogger('app');
  var App = function(options) {
    console.log('this', this)
    this.initialize(options);
  };

  App.extend = Backbone.View.extend;

  App = App.extend({
    initialize: function  initialize() {
      logger.log('App initialize');
      this.router = new Router({app : this});
      this.views = {
        menu : this.getMenuView()
      };

      this.views.menu.render();

      this.views.menu.$('.add-marker').on('click', _.bind(function () {
        logger.log('Add a marker');
        this.addMarker();
      }, this));
      this.views.menu.$('.remove-markers').on('click', _.bind(function () {
        this.views.map.clearMarkers();
      }, this));
      this.views.menu.$('.travel').on('click', _.bind(function () {
        this.travel();
      }, this));
      this.views.menu.$('.zoom').on('click', _.bind(function () {
        this.views.map.setZoom(Math.floor(Math.random() * 15) + 2);
      }, this));

      this.router.start();
    },
    getMenuView : function getMenuView() {
      return new List({
          el : '.menu',
          template : '<ul><%=children%></ul>',
          itemTemplate : '<a class="<%=item.className%>" <% if (item.url) {%>href="#<%=item.url%>"<%}%>><%= item.name %></a>',
          collection : new Backbone.Collection(this.getMenuEntries())
        });
    },
    getMenuEntries : function getMenuEntries() {
      return [
        {name: 'Google Maps', url: '/google'},
        {name: 'Bing Maps', url: '/bing'},
        {name: 'OpenStreetMap', url: '/osm'},
        {name: 'Add a marker', url: null, className: 'add-marker'},
        {name: 'Remove markers', url: null, className: 'remove-markers'},
        {name: 'Travel', url:null, className:'travel'},
        {name: 'Change Zoom', url:null, className:'zoom'},
      ];
    },
    resetMap : function resetMap() {
      if (this.views.map) {
        this.views.map.$el.html('');
        this.views.map.stopListening();
        this.views.map.markers = [];
      }
    },
    showMap : function showMap(provider, options) {
      this.resetMap();
      var mapOptions = _.extend({}, options ? options.mapOptions : {}, {provider: provider});

      this.views.map = new Map({
        el : '.map-container',
        template : '<div id="map"></div>',
        mapOptions : mapOptions
      });
      this.views.map.render();
      if (this.markers) {
        this.views.map.addMarkers(this.markers);
      }
    },
    addMarker : function addMarker() {
      var position = this.views.map.getCenter();
      var already = this.views.map.markers.length;
      var latOffset = (Math.round(Math.random()*100)%2==0 ? 1 : -1)  * Math.random() * already*.05;
      var lngOffset = (Math.round(Math.random()*100)%2==0 ? 1 : -1)  * Math.random() * already*.1;
      position.lat += latOffset;
      position.lng += lngOffset;

      this.views.map.addMarker(position);
      this.markers ? this.markers.push(position) : this.markers=[position];

    },
    travel: function travel() {
      var cities = [
        {name: 'Paris', lat: 49, lng: 2},
        {name: 'Rome', lat: 41, lng: 12},
        {name: 'Shanghai', lat: 31, lng: 121},
        {name: 'Sydney', lat: -34, lng: 151},
        {name: 'Rio', lat: -23, lng: -43},
        {name: 'New York', lat: 40, lng: -73}
      ];
      var destination = cities[Math.floor(Math.random()*cities.length)];
      if (destination.lat == Math.round(this.views.map.getCenter().lat)){
        return this.travel();
      }
      logger.log('Traveling to', destination, 'from', this.views.map.getCenter());
      this.views.map.setCenter(destination);
    }
  });


  // initialize Woodman and start the application once done
  woodman.load({
    appenders: [
      {
        type: 'console',
        name: 'console',
        layout: {
          type: 'pattern',
          pattern: '%-5.5p [%c] %m%n'
        }
      }
    ],
    loggers: [
      {
        level: 'all',
        appenders: [
          'console'
        ]
      }
    ]
  }, function () {
    logger.log('Woodman initialized');

  });
  
  return App;
});
