/*

  Displays a Google map, with an optional icon and overlay.

*/

define(["joshlib!uielement","joshlib!utils/dollar","joshlib!vendor/underscore"], function(UIElement,$,_) {

  var UIMap = UIElement.extend({
    defaultOptions:{
      latitude:undefined,
      longitude:undefined,
      icon:null,
      mapOptions:{
        zoom:6,
        centerLatLng:{lat: 48.8674163, lng:2.3690762999999606},//Default center, Joshfire HQ: 100 rue de la Folie-Méricourt Paris France
        provider:'google',
        mapType:'terrain',
        enable3D:false,
        provider3D:'BING',
        mapType3D:'AerialWithLabel'
      },
      markerOptions:{},
      openOverlay:false,
      overlayOptions:{}
    },


    initialize: function(options) {

      options = _.extend(this.defaultOptions, options);
      

      if (options.template){
        this.template = this.compileTemplate(options.template);
      }
      else if (options.templateEl) {
        this.template = this.compileTemplate($(options.templateEl).html());
      }

      if (options.overlayTemplate){
        this.overlayTemplate = this.compileTemplate(options.overlayTemplate);
      }
      else if (options.overlayTemplateEl) {
        this.overlayTemplate = this.compileTemplate($(options.overlayTemplateEl).html());
      }

      this.mapOptions = options.mapOptions || {};
      this.markerOptions = options.markerOptions || {};
      this.overlayOptions = options.overlayOptions || {};
      this.openOverlay = options.openOverlay;

      this.latitude = options.latitude || options.mapOptions.centerLatLng.lat;
      this.longitude = options.longitude || options.mapOptions.centerLatLng.lng;
      this.icon = options.icon;

      UIElement.prototype.initialize.call(this, options);
    },

    generate: function(cb) {
      cb(null, this.template({data: this.data}));
    },

    enhance: function() {
      var self=this;
      var center = new google.maps.LatLng(this.latitude, this.longitude);


      var params = {
        center:     center,
        zoom:       12,
        mapTypeId:  google.maps.MapTypeId.ROADMAP
      };

      _.extend(params, this.mapOptions);

      self.map = new google.maps.Map($(this.el).children().first().get(0), params);

      if(this.icon) {
        var markerOptions = {
          position: center,
          map:      self.map,
          icon:     this.icon
        };

        _.extend(markerOptions, this.markerOptions);

        var marker = new google.maps.Marker(markerOptions);

        if(this.overlayTemplate)
        {
          var infoWindow = new google.maps.InfoWindow({
            content: this.overlayTemplate(this.overlayOptions)
          });

          google.maps.event.addListener(marker, 'click', function() {
            infoWindow.open(self.map, marker);
          });

          if(this.openOverlay) {
            infoWindow.open(self.map, marker);
          }
        }
      }

      UIElement.prototype.enhance.call(this);
    }
  });

  return UIMap;
});