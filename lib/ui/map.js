/*

  Display a map, using Google Maps, Open StreetMap or Bing Mas
  OSM Maps are displayed over a google maps, using custom tiles

*/

define([
    'joshlib!uielement',
    'joshlib!utils/dollar',
    'joshlib!vendor/underscore',
    'joshlib!utils/getscript',
    'joshlib!utils/woodman',
    'joshlib!vendor/webglearth'
  ],
  function (
    UIElement,
    $,
    _,
    getScript,
    woodman,
    useless
  ) {

    var logger = woodman.getLogger('joshlib.ui.map');

    var UIMap = UIElement.extend({
      defaultOptions: {
        latitude: undefined,
        longitude: undefined,
        icon: null,
        openOverlay: false,
        enable3D: false,
        mapOptions: {},
        map3DOptions: {},
        markerOptions: {},
        overlayOptions: {}

      },
      defaultMapOptions: {
        zoom: 6,
        centerLatLng: {lat:  48.8674163, lng: 2.3690762999999606},//Default center, Joshfire HQ:  100 rue de la Folie-Méricourt Paris France
        provider: 'google',
        mapType: 'terrain'
      },
      defaultMap3DOptions: {
        provider: 'bing',
        mapType: 'AerialWithLabels',
        proxyHost: 'http://data.webglearth.com/cgi-bin/corsproxy.fcgi?url=',
        maxAscent : 0.3,
        altitude : 150000,
        travelDuration : 4000 //ms
      },
      defaultMarkerOptions: {},
      defaultOverlayOptions: {},
      webGLEnabled: false,
      googleMapsScript: 'http://maps.google.com/maps/api/js?sensor=false&callback=mapInitCallback',
      bingMapsScript: 'http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&onscriptload=mapInitCallback',
      providerInitTimeout: 5000, //Stop xaiting for maps provider after x seconds
      /**
      * Marker Options
      * Specified in item.options, fallback on default values
      * <ul>
      * <li>options.markerDraggable (bool),  defaults false</li>
      * <li>options.markerShadow (bool), defaults true</li>
      * @function
      * return {Object} hash of options
      */
      getMarkerOptions: function () {
        var opts = {
          //color:this.options.markerColor || 'blue',
          draggable: this.options.markerDraggable || false,
          flat: !this.options.markerShadow
        };
        if (this.options.markerIconUrl) {
          opts.icon = {url: this.options.markerIconUrl};
          if (this.options.markerIconSpriteOrigin) {
            opts.icon.origin = this.options.markerIconSpriteOrigin;
          }
          if (this.options.markerIconWidth && this.options.markerIconHeight) {
            opts.icon.size = {width: this.options.markerIconWidth, height: this.options.markerHeight};
          }
        }
        return opts;
      },
      initialize: function (options) {

        if (this.options && this.options.mapOptions && this.options.mapOptions.provider) {
          if (this.options.mapOptions.provider === 'bing'){
            this.defaultMapOptions.mapType = 'aerial';
          }
          if (this.options.mapOptions.provider === 'osm'){
            this.defaultMapOptions.mapType = 'default';
          }
           
        }

        this.options = _.extend({}, this.defaultOptions, options);
        this.options.mapOptions = _.extend({}, this.defaultMapOptions, this.options.mapOptions);
        this.options.map3DOptions = _.extend({}, this.defaultMap3DOptions, this.options.map3DOptions);
        this.options.markerOptions = _.extend({}, this.defaultMarkerOptions, this.options.markerOptions);
        this.options.overlayOptions = _.extend({}, this.defaultOverlayOptions, this.options.overlayOptions);

        this.provider = this.options.mapOptions.provider.toLowerCase();
        this.mapType  = this.options.mapOptions.mapType;
        if (this.provider === 'osm') {
          this.OSM_mapType = 'osm-' + this.mapType;
          this.mapType = 'osm';
          this.provider = 'google';
        }

        if (this.options.template) {
          this.template = this.compileTemplate(this.options.template);
        }
        else if (this.options.templateEl) {
          this.template = this.compileTemplate($(this.options.templateEl).text());
        }

        if (this.options.overlayTemplate) {
          this.overlayTemplate = this.compileTemplate(this.options.overlayTemplate);
        }
        else if (this.options.overlayTemplateEl) {
          this.overlayTemplate = this.compileTemplate($(this.options.overlayTemplateEl).text());
        }
        if (this.options.enable3D && this.isWebGLReady()) {
          this.webGLEnabled = true;
        }

        this.mapOptions =  this.options.mapOptions || {};
        this.markerOptions = this.options.markerOptions || {};
        this.overlayOptions = this.options.overlayOptions || {};
        this.openOverlay = this.options.openOverlay;

        this.latitude = this.options.latitude || this.options.mapOptions.centerLatLng.lat;
        this.longitude = this.options.longitude || this.options.mapOptions.centerLatLng.lng;
        this.icon = this.options.icon;

        this.markers = [];

        UIElement.prototype.initialize.call(this, this.options);
      },

      generate: function (cb) {
        cb(null, this.template({data: this.data}));
      },
      enhance: function () {

        if (this.webGLEnabled) {
          this.enhance3D();
        }
        else {
          this.enhance2D();
        }
      },
      enhance2D: function () {
        var globalScopeMapObject, mapScriptURL;

        switch (this.provider) {
        case 'bing':
          globalScopeMapObject = window.Microsoft;
          mapScriptURL = this.bingMapsScript;
          if (this.options.lang) {
            if (this.options.lang.match(/-/)) {
              mapScriptURL += '&mkt=' + this.options.lang;
            }
            else {
              mapScriptURL += '&mkt=' + this.options.lang.toLowerCase() + '-' + this.options.lang.toUpperCase();
            }
          }
          break;
        case 'google':
          globalScopeMapObject = window.google;
          mapScriptURL = this.googleMapsScript;
          if (this.mapOptions.providerKey) {
            mapScriptURL += '&key=' + encodeURIComponent(this.mapOptions.providerKey);
          }
        }
        if (typeof globalScopeMapObject === 'undefined') {
          window.mapInitCallback = _.bind(function () {this.enhance2D(); }, this);
          setTimeout(_.bind(function () {
            if (!this.map) {
              logger.warn('Async map init failed within ', this.providerInitTimeout);
              this.trigger('maperror');
            }
          }, this), this.providerInitTimeout);

          return getScript(mapScriptURL, function () {
            //Script loaded callback
            //Not to be confused with 'map initialized and ready to use' callback
            logger.log('loaded script', mapScriptURL);
          });
        }

        var params = {
          center:     this.getCoords({lat: this.latitude, lng: this.longitude}),
          zoom:       12,
          mapTypeId:   this.getMapTypeId()
        };
        _.extend(params, this.mapOptions);

        switch (this.provider) {
        case 'bing':
          _.extend(params, {
            credentials: this.mapOptions.providerKey,
            showMapTypeSelector : params.disableDefaultUI ? false : true
          });
          if (params.disableDefaultUI){
            params.showScaleBar = false;
            params.showDashboard = false;
            params.showMapTypeSelector = false;
            
          }
          this.map = new Microsoft.Maps.Map(this.$el.children().first().get(0), params);
          this.translateGoogleMapOptionsToBingEvents(params, this.map);
          break;
        case 'google':
          this.map = new google.maps.Map(this.$el.children().first().get(0), params);
          /* Add OSM tiles support */
          if (this.mapType === 'osm') {
            this.addOSMInGmapsSupport();
          }
        }
        UIElement.prototype.enhance.call(this);
        this.trigger('mapready');
      },
      translateGoogleMapOptionsToBingEvents: function (params,map) {
        /* 
        * No map options to disable these features.
        * Instead, add events listeners, and cancel actions
        **/
        if (params.scrollwheel === false) {
          Microsoft.Maps.Events.addHandler(map, 'mousewheel', function (evt) {
            //cancel mousewheel zoom
            evt.handled = true;
          });
        }
        if (params.draggable === false) {
          Microsoft.Maps.Events.addHandler(map, 'mousedown', function (evt) {
            //cancel click & drag
            evt.handled = true;
          });
        }
        if (params.disableDoubleClickZoom === false) {
          Microsoft.Maps.Events.addHandler(map, 'dblclick', function (evt) {
            //cancel double-click zoom
            evt.handled = true;
          });
        }
      },
      gmaps_enhance2D: function () {
        if (this.icon) {
          var markerOptions = {
            position: center,
            map:      this.map,
            icon:     this.icon
          };

          _.extend(markerOptions, this.markerOptions);

          var marker = new google.maps.Marker(markerOptions);

          if (this.overlayTemplate)
          {
            var infoWindow = new google.maps.InfoWindow({
              content: this.overlayTemplate(this.overlayOptions)
            });

            google.maps.event.addListener(marker, 'click', function () {
              infoWindow.open(this.map, marker);
            });

            if (this.openOverlay) {
              infoWindow.open(this.map, marker);
            }
          }
        }

      },
      enhance3D: function () {
        //    require(['joshlib!vendor/webglearth'], function () {
        //3D 
        this.map = new window.WebGLEarth('map',
                 _.extend({ position: [this.options.mapOptions.centerLatLng.lat, this.options.mapOptions.centerLatLng.lng]}, this.options.map3DOptions));

        this.map.setBaseMap(
          this.map.initMap(window.WebGLEarth.Maps[this.options.map3DOptions.provider.toUpperCase()], [this.options.map3DOptions.mapType, this.options.map3DOptions.providerKey])
        );

        // this.map.setBaseMap(
        //   this.map.initMap(WebGLEarth.Maps[options.provider], [options.mapType, options.providerKey])
        // );

        this.trigger('mapready');
      },
      /**
      * Translate map type from string to provider's mapType
      * @function
      * @return {String | google.maps.MapTypeId}
      **/
      getMapTypeId: function () {
        if (this.webGLEnabled) {
          //do your stuff webglearth
          return mapTypeStr;
        }
        switch (this.provider) {
        case 'google':
          switch (this.mapType) {
          case 'roadmap':
            return google.maps.MapTypeId.ROADMAP;
            break;
          case 'satellite':
            return google.maps.MapTypeId.SATELLITE;
            break;
          case 'hybrid':
            return google.maps.MapTypeId.HYBRID;
            break;
          case 'osm':
            return this.OSM_mapType;
            break;
          case 'terrain':
          default:
            return google.maps.MapTypeId.TERRAIN;
          }
          break;
        case 'bing':
          switch (this.mapType) {
            case 'roadmap':
            case 'road':
              return Microsoft.Maps.MapTypeId.road;
              break;
            case 'satellite':
            case 'aerial':
            default:
              return Microsoft.Maps.MapTypeId.aerial;
          }
        default:
          return null;
        }
        return null;
      },
      /**
      * Refresh data in the Map
      * <br />Pins markers on the map for every data entry having latitude & longitude
      * <br />If markers, fit maps bound to show everyone of them.
      * @function
      * @param {Function} callback callback when refreshed.
      */
      refresh: function (callback) {
        if (this.webGLEnabled) {
          ///
        }
        else {
          this.refresh2D(callback);
        }
      },
      /**
      * Refresh 2D Map
      * @function
      * @param {Function} callback
      **/
      refresh2D: function (callback) {
        this.setCenter(this.mapOptions.centerLatLng);

        if (this.provider==='google') {
          google.maps.event.trigger(this.map, 'resize');
        }
        
        this.trigger('map.refreshed');
        callback && callback();
      },
      /**
      * Get center
      * @function
      * @return {Object} center ({lat: , lng:})
      **/
      getCenter: function () {
        var center;
        if (this.webGLEnabled) {
          center = this.map.getPosition();
          return {lat: center[0], lng: center[1]};
        }
        else {
          switch (this.provider) {
            case 'bing':
              center = this.map.getCenter();
              return {lat: center.latitude, lng: center.longitude};
              break;
            case 'google':
              center = this.map.getCenter();
              return {lat: center.lat(), lng: center.lng()};
          }
          
        }
      },
      /**
      * Set center
      * @function
      * @param {Object} {lat: , lng:}
      **/
      setCenter: function (location) {
        if (this.webGLEnabled) {
          //
        }
        else {
          switch (this.provider) {
            case 'bing':
              this.map.setView({center:this.getCoords(location)});
              break;
            case 'google':
              this.map.setCenter(this.getCoords(location));
          }
        }
      },
      /**
      * Returns current zoom level
      * @function
      * @return {int} zoom level
      **/
      getZoom: function () {
        if (this.map) {
          switch (this.provider) {
            case 'bing':
            case 'google':
              return this.map.getZoom();
          }
        }
        return 0;
      },
      /**
      * set zoom level
      * @function
      * @param {int} zoom level
      **/
      setZoom: function (zoom) {
        if (this.map) {
          switch (this.provider) {
            case 'bing':
              this.map.setView({zoom:zoom});
              break;
            case 'google':
              this.map.setZoom(zoom);
          }
        }
        return null;
      },
      /** relative change of zoom level
      * @function 
      * @param {int} relative change
      **/
      changeZoom: function (step) {
        var min = 0;
        var max = 15;
        var actual=this.getZoom();
        
        var newZoom = actual+step;
        
        if (newZoom< min) newZoom=min;
        if (newZoom > max) newZoom=max;
        
        this.setZoom(newZoom);
        
      },
      /**
      * Pan to a specific location
      * If point is in bounds, move smoothly
      * else ... juste change center
      * @function
      * @param {Object} location (lat, lng)
      **/
      panTo: function (location) {
        if (!location || !this.map || typeof location.lat=='undefined' || typeof location.lng=='undefined') {
          return false;
        }
        switch (this.provider) {
          case 'bing':
            this.setCenter(location);
            break;
          case 'google':
            this.map.panTo(this.getCoords(location));
        }
      },
       /** Map GMaps new google.maps.latLng function
        * @function
        * @param {float} lat
        * @param {float} lng
        * @param {Object} location (lat, lng)
        **/
        getCoords: function (location) {
          return this.webGLEnabled ? this.getCoords3D(location) : this.getCoords2D(location);
        },
        /** Map GMaps new google.maps.latLng function
        * @function
        * @param {Object} location (lat, lng)
        **/
        getCoords2D: function (location) {
           switch (this.provider) {
            case 'bing':
              return new Microsoft.Maps.Location(location.lat, location.lng);
              break;
            case 'google':
              return new google.maps.LatLng(location.lat, location.lng);
          }
        },
        /** 
        * @function
        * @param {float} lat
        * @param {float} lng
        * @param {Object} location (lat, lng)
        **/
        getCoords3D: function (location) {
          return [location.lat, location.lng];
        },
        /** 
        * Add a colleciton of markers
        * @function
        * @param {Array} tab
        **/
        addMarkers: function addMarkers(tab) {
          _.each(tab, _.bind(function (item) {
            if (item.lat && item.lng) {
              this.addMarker(item, _.extend(this.getMarkerOptions(), {
                title: item.title
              }));
            }
          }, this));
        },
        /** Add a marker
        * @function
        * @param {Object} location (lat, lng)
        * @param {Object} options
        */
        addMarker: function (location, options) {
          if (!this.map) {
            return false;
          }
          
          if (this.webGLEnabled) {
            marker=this.addMarker3D(this.getCoords(location), options);
          }
          else {
            marker=this.addMarker2D(this.getCoords(location), options);
          }
          
          this.markers.push(marker);
          return marker;
        },
        addMarker2D: function (latLng, options) {
          var marker;
          switch (this.provider) {
            case 'bing':
              logger.log('bing', latLng);
              marker = new Microsoft.Maps.Pushpin(latLng);
              this.map.entities.push(marker);
              Microsoft.Maps.Events.addHandler(marker, 'mouseup', _.bind(function (ev){
                this.trigger('map.selectMarker', marker);
              }, this));
              break;
            case 'google':
            logger.log('google', latLng);
              marker = new google.maps.Marker(_.extend({}, options, {position:latLng}));
              marker.setMap(this.map);
              //this.map.markers.push(tmp_marker);
              google.maps.event.addListener(marker, 'mouseup', _.bind(function (ev) {
                this.trigger('map.selectMarker', marker); //should forward marker's attached data.
              }, this));
          }
          return marker;
        },
        addMarker3D: function (latLng, options) {
          return this.map.initMarker(latLng[0], latLng[1]);
        },
        /** Clear Google maps markers 
        * @function
      ¨*/
        clearMarkers: function () {
          if (!this || !this.markers) {
            return false;
          }
          _.each(this.markers, _.bind(function (marker) {
            this.removeMarker(marker);
          }, this));
          return true;
        },
        /**
        * Remove a specific marker from the map
        **/  
        removeMarker: function (marker) {
          logger.log('marker', marker);
          if (this.webGLEnabled) {
            marker.detach();
          }
          else {
            switch (this.provider) {
              case 'bing':
                this.map.entities.remove(marker);
                break;
              case 'google':
                marker.setMap(null);
                break;  
            }
            
          }
        },
       /***
        * We had issues google.maps.LatLngBounds.contains(LatLngBounds), so built our own implementation
        * @function
        * @param {Object} location (lat, lng)
        * @return {bool} isInBounds
        **/
        isInBounds: function (location) {
          return this.webGLEnabled ? this.isInBounds3D(location) : this.isInBounds2D(location);
        },
        /* @function 
        * @param {Obkect} location (lat, lng)
        * @return {bool} 
        **/
        isInBounds2D: function isInBounds(location) {

          switch (this.provider) {
            case 'bing':
              //TODO ©
              //this.map.getBounds() : returns a Microsoft.Maps.LocationRect : http://msdn.microsoft.com/en-us/library/gg427621.aspx
              //Microsoft.Maps.Location ? http://msdn.microsoft.com/en-us/library/gg427612.aspx
              return false;
            case 'google':
              var latLng = this.getCoords(location);
              var mapBounds = this.map && this.map.getBounds();
              if (!mapBounds) {
                return false;
              }
              var bounds = new google.maps.LatLngBounds(mapBounds.getSouthWest(), mapBounds.getNorthEast());
              var latInBounds = latLng.lat()>=mapBounds.getSouthWest().lat() && latLng.lat()<=mapBounds.getNorthEast().lat();
              if (!latInBounds) {
                return false;
              }

              //latitude ok, check longitude now
              var lngInBounds=false;
              var lngEast = mapBounds.getNorthEast().lng();
              var lngWest = mapBounds.getSouthWest().lng();
              var lngTarget = latLng.lng();

              //weird getBounds() result ?? west & east inverted when across greenwich. More min/max than west/east
              if ((lngEast <0 && lngEast >-180) &&  (lngWest>0 && lngWest<180)) {
                var tmp=lngEast;
                lngEast=lngWest;
                lngWest=tmp;
              } 


              //Translate longitudes on 0->360, easier to deal with than 0->180/-180->0
             if (lngEast < 0) lngEast+=360;
             if (lngWest < 0) lngWest+=360;
             if (lngTarget < 0) lngTarget+=360;


              if (lngEast>lngWest) {
                //classic east.lng > west.lng => target.lng should be between west & east
                lngInBounds = lngTarget>=lngWest &&lngTarget<=lngEast;
              }
              else {
                //across greenwich
                //target.lng should be between lngWest & 360 OR between 0 & lng East
                lngInBounds = (lngTarget>180 && lngTarget>=lngWest) || (lngTarget<=180 && lngTarget<=lngEast);
              }

              return lngInBounds;
            }
        },
        /* Unused 
        * @function 
        * @param {Obkect} location (lat, lng)
        * @return {bool} 
        **/
        isInBounds3D: function (location) {
          return true;
        },
        /** 
        * Add info window
        * @function
        * @param {Object} location (lat, lng)
        * @param {String} html
        */
        addInfoWindow: function (location, html) {
          switch (provider){
            case 'bing':
              logger.warn('addInfoWindow', 'not implemented');
              return false;
              break;
            case 'google':
              var latLng = this.getCoords(location);
              
              
              
              if (!this.infoWindow) {
                this.infoWindow=new google.maps.InfoWindow();
              }
              this.infoWindow.setContent(html);
              this.infoWindow.setPosition(latLng);
              this.infoWindow.open(uiElement.map);
              break;
            }
        },
        /**
        * Move map to new point
        * @function
        * @param {Object} location {city, country, lat, lng}
        * @param {Object} options
        * @param {Function} callback, to be called upon arrival
        **/
        moveToLocation: function (location, options,callback) {
          if (this.webGLEnabled) {
            return this.moveToLocation3D(location,options, callback);
          }
          else {
            return this.moveToLocation2D(location,options,callback);
          }
        }, 
        /**
        * Move map to new point, in a 2D Google Maps
        * @function
        * @param {Object} location {city, country, lat, lng}
        * @param {Object} options
        * @param.options {int} zoomTimer, time between each zoom operation
        * @param.options {bool} clearMarkers
        * @param.options {Function} callback, to be called upon arrival
        **/

        moveToLocation2D: function (location, options, callback) {
          if (this.provider=='bing') {
            //the setView({center:{x,y}}) is the only way to move
            this.setCenter(location);
            callback();
            return;
          }

          var initialZoom = this.getZoom();
          options = _.extend({zoomTimer:500, minZoom:3, clearMarkers: false}, options);
          var map = this.map;
          //loops
          var zoomInLoop, zoomOutLoop;
          if (options.clearMarkers) {
            /* clear markers */
            this.clearMarkers(); 
          }
          // var latLng=this.getCoords(location);
          //console.log('map move to', location)
          if (!this.isInBounds(location)) {
            clearInterval(zoomInLoop);
            clearInterval(zoomOutLoop);
            zoomOutLoop= setInterval(_.bind(function () {
              //console.log('zoom out', this.getZoom())
              if (this.isInBounds(location) || this.getZoom()<=options.minZoom) {
                //console.log('stop zooming out', this.getZoom(), options.minZoom)
                clearInterval(zoomOutLoop);
                this.panTo(location);
                var zoomInLoop = setInterval(_.bind(function () {
                  //console.log('zoom in', this.getZoom(), initialZoom)
                  if (this.getZoom()>=initialZoom) {
                    //console.log('stop zooming in', this.getZoom());
                     if (callback) {
                      //console.log('callback from zoom in')
                       callback();
                    }
                    return clearInterval(zoomInLoop);
                  }
                  this.changeZoom(+1);

                }, this), options.zoomTimer);
               
                return true;
              }
              this.changeZoom(-1);
              
              return false;
            },this), options.zoomTimer);
          }
          else
          {
            this.panTo(location);
            if (callback) {
              //console.log('callback from else')
              callback();
            }
          }

        },
        /***
        ** Move to location, webGL mode
        * @function
        * @param {Object} location {city, country, lat, lng}
        * @param {Object} options
        * @param {Function} callback, to be called upon arrival
        **/
        moveToLocation3D: function (location, options,callback) {
            var lat = parseFloat(location.lat);
            var lng = parseFloat(location.lng);
            
             if (options.clearMarkers) {
                /* clear markers */
                this.clearMarkers(); 
              }
            // if we are nearly at the same place we dont play the animation
          var current_position = this.getCenter();
          var delta_lat = Math.abs(lat-current_position.lat);
          var delta_lng = Math.abs(lng-current_position.lng);
          if (delta_lat < 1e-6 && 
              delta_lng < 1e-6) {
              callback();
              return;
          }
     
          var duration = this.getTravelDuration(this.options.map3DOptions.travelDuration,current_position, {lat:lat, lng:lng});
          
          
          
            
            this.map.flyTo(lat, lng, this.options.map3DOptions.maxAscent, duration, this.options.map3DOptions.altitude);
            setTimeout(function () {
                callback();
            }, duration);
        },
        /**
        * Adapt travel duration considering distance
        * @function
        * @param {int} min min time, in ms
        * @param {Object} current lat/lng
        * @param {Object} next lat/lng
        **/
        getTravelDuration: function (min,current, next) {
           // make the range in 0-360 degree
           var delta_lat =  next.lat-current.lat;
           var delta_lng =  next.lng-current.lng;
           var dist = Math.sqrt(delta_lat*delta_lat + delta_lng*delta_lng);

           var ratio = (dist%180)/180.0;

           var varyingTime = 4000 * ratio;
           var duration = varyingTime + min;
  //             console.log("Distance = " + dist.toString() + " duration " + duration);
           return duration;
        },
        /**
        * Is this device WebGL ready ?
        * @function
        * @return {bool}
        **/
        isWebGLReady: function () {
          var ready = false;
          //webgl rendering context available ?
          if (!window.WebGLRenderingContext) {
            return ready;
          }
          
          //context available .. is it trustworthy ?
          var canvas=document.createElement('canvas');
          var contexts = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
           var test = null;
           for (var i = 0; i < contexts.length; ++i) {
             try {
               test = canvas.getContext(contexts[i], null);
             } catch(e) {}
             if (test) {
               ready = true;
               break;
             }
           }
           
          return ready;
        },
        /**
        * Add support for OSM tiles within gmaps
        **/
        addOSMInGmapsSupport: function addOSMInGmapsSupport() {
           this.map.mapTypes.set("osm-default", new google.maps.ImageMapType({
            getTileUrl: function (coord, zoom) {
              return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
            },
            tileSize: new google.maps.Size(256, 256),
            name: "OpenStreetMap",
            maxZoom: 18
          }));

          this.map.mapTypes.set("osm-mapbox", new google.maps.ImageMapType({
            getTileUrl: function (coord, zoom) {
              return "http://b.tiles.mapbox.com/v3/examples.map-vyofok3q/"+ zoom + "/" + coord.x + "/" + coord.y +".png";
            },
            tileSize: new google.maps.Size(256, 256),
            name: "OpenStreetMap",
            maxZoom: 17
          }));

          this.map.mapTypes.set("osm-toner", new google.maps.ImageMapType({
            getTileUrl: function (coord, zoom) {
              return "http://a.tile.stamen.com/toner/"+ zoom + "/" + coord.x + "/" + coord.y +".png";
            },
            tileSize: new google.maps.Size(256, 256),
            name: "OpenStreetMap",
            maxZoom: 18
          }));

          this.map.mapTypes.set("osm-mapquest-map", new google.maps.ImageMapType({
            getTileUrl: function (coord, zoom) {
              return "http://otile1.mqcdn.com/tiles/1.0.0/map/"+ zoom + "/" + coord.x + "/" + coord.y +".png";
            },
            tileSize: new google.maps.Size(256, 256),
            name: "OpenStreetMap",
            maxZoom: 18
          }));
           this.map.mapTypes.set("osm-mapquest-sat", new google.maps.ImageMapType({
            getTileUrl: function (coord, zoom) {
              return "http://otile1.mqcdn.com/tiles/1.0.0/sat/"+ zoom + "/" + coord.x + "/" + coord.y +".png";
            },
            tileSize: new google.maps.Size(256, 256),
            name: "OpenStreetMap",
            maxZoom: 18
          }));
          /*
          this.map.mapTypes.set('osm-opencyclemap', new google.maps.ImageMapType({
            getTileUrl:function(coord, zoom) {
              console.warn('get tile', coord, zoom)
              return "http://b.tile.opencyclemap.org/cycle/" + zoom + "/" + coord.x + "/" + coord.y +".png";
            },
            tileSize: new google.maps.Size(256, 256),
            name: "OpenStreetMap",
            maxZoom: 18
          }));
*/  

          /*
           * Terrain is only OK for USA
          this.map.mapTypes.set("osm-terrain", new google.maps.ImageMapType({
            getTileUrl: function (coord, zoom) {
                return "http://a.tile.stamen.com/terrain/"+ zoom + "/" + coord.x + "/" + coord.y +".png";
            },
            tileSize: new google.maps.Size(256, 256),
            name: "OpenStreetMap",
            maxZoom: 18
          }));
          */
          /* Watercolor : SLOW */
          this.map.mapTypes.set("osm-watercolor", new google.maps.ImageMapType({
            getTileUrl: function (coord, zoom) {
                return "http://a.tile.stamen.com/watercolor/" + zoom + "/"+ coord.x+ "/" + coord.y+".png";
            },
            tileSize: new google.maps.Size(256, 256),
            name: "OpenStreetMap",
            maxZoom: 18
          }));
        }
    });

    return UIMap;
  });