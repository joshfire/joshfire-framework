/*

  Displays a Google map, with an optional icon and overlay.

*/

define(["joshlib!uielement","joshlib!utils/dollar","joshlib!vendor/underscore", "joshlib!utils/getscript", "joshlib!vendor/webglearth"], function(UIElement,$,_, getScript) {
  var UIMap = UIElement.extend({
    defaultOptions:{
      latitude:undefined,
      longitude:undefined,
      icon:null,
      openOverlay:false,
      enable3D:false,
      mapOptions:{},
      map3DOptions:{},
      markerOptions:{},
      overlayOptions:{}

    },
    defaultMapOptions:{
      zoom:6,
      centerLatLng:{lat: 48.8674163, lng:2.3690762999999606},//Default center, Joshfire HQ: 100 rue de la Folie-Méricourt Paris France
      provider:'google',
      mapType:'terrain'
      
    },
    defaultMap3DOptions:{
      provider:'bing',
      mapType:'AerialWithLabels',
      proxyHost:'http://data.webglearth.com/cgi-bin/corsproxy.fcgi?url=',
      maxAscent : .3,
      altitude : 150000,
      travelDuration : 4000 //ms
    },
    defaultMarkerOptions:{},
    defaultOverlayOptions:{},
    webGLEnabled:false,
    googleMapsScript:'http://maps.google.com/maps/api/js?sensor=false&callback=gmapsCallback',

    
    /**
    * get 3D Maps specific options
    * @function
    * @return {Object} options
    **/
    /**
    * Marker Options
    * Specified in item.options, fallback on default values
    * <ul>
    * <li>options.markerDraggable (bool),  defaults false</li>
    * <li>options.markerShadow (bool), defaults true</li>
    * @function
    * return {Object} hash of options
    */
    getMarkerOptions: function() {
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
    initialize: function(options) {

      this.options = _.extend({},this.defaultOptions, options);
      this.options.mapOptions = _.extend({}, this.defaultMapOptions,this.options.mapOptions);
      this.options.map3DOptions = _.extend({}, this.defaultMap3DOptions,this.options.map3DOptions);
      this.options.markerOptions = _.extend({}, this.defaultMarkerOptions, this.options.markerOptions);
      this.options.overlayOptions = _.extend({}, this.defaultOverlayOptions, this.options.overlayOptions);


      if (this.options.template){
        this.template = this.compileTemplate(this.options.template);
      }
      else if (this.options.templateEl) {
        this.template = this.compileTemplate($(this.options.templateEl).html());
      }

      if (this.options.overlayTemplate){
        this.overlayTemplate = this.compileTemplate(this.options.overlayTemplate);
      }
      else if (this.options.overlayTemplateEl) {
        this.overlayTemplate = this.compileTemplate($(this.options.overlayTemplateEl).html());
      }
       if (this.options.enable3D && this.isWebGLReady()){
          this.webGLEnabled=true;
        }

      this.mapOptions =  this.options.mapOptions || {};
      this.markerOptions = this.options.markerOptions || {};
      this.overlayOptions = this.options.overlayOptions || {};
      this.openOverlay = this.options.openOverlay;

      this.latitude = this.options.latitude || this.options.mapOptions.centerLatLng.lat;
      this.longitude = this.options.longitude || this.options.mapOptions.centerLatLng.lng;
      this.icon = this.options.icon;

      UIElement.prototype.initialize.call(this, this.options);
    },

    generate: function(cb) {
      cb(null, this.template({data: this.data}));
    },

    enhance: function() {

      if (this.webGLEnabled){
        this.enhance3D();
      }
      else{
        this.enhance2D();
      }
    },
    enhance2D:function(){
      var self=this;
      if (typeof google==='undefined'){

        /** gmaps callback must be in global scope **/
        window.gmapsCallback = function(){
           self.enhance2D();
        }


        return getScript(this.googleMapsScript,function(){
          //script loaded, but gmaps may not be initialized yet.
          // do not trust this callback
          // trust the window.gmapsCallback one
          
          
        });
      }


      var center = new google.maps.LatLng(this.latitude, this.longitude);

      var params = {
        center:     center,
        zoom:       12,
        mapTypeId:   this.getMapTypeId(this.options.mapOptions.provider,this.options.mapOptions.mapType)
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

    },
    enhance3D:function(){
    //    require(['joshlib!vendor/webglearth'], function(){
      var self = this;
      //3D 
      self.map = new WebGLEarth('map',
               _.extend({ position:[
                  this.options.mapOptions.centerLatLng.lat,
                  this.options.mapOptions.centerLatLng.lng
                ]
              }, this.options.map3DOptions));

      self.map.setBaseMap(

        self.map.initMap(WebGLEarth.Maps[self.options.map3DOptions.provider.toUpperCase()], [self.options.map3DOptions.mapType,self.options.map3DOptions.providerKey])
      );

      // self.map.setBaseMap(
      //   self.map.initMap(WebGLEarth.Maps[options.provider], [options.mapType, options.providerKey])
      // );
      
    },
    /**
        * Translate map type from string to provider's mapType
        * @function
        * @param {string} mapTypeStr
        * @return {String | google.maps.MapTypeId}
        **/
        getMapTypeId: function(provider, mapTypeStr) {
          
          if (!mapTypeStr && provider){
            //prev version, provider is google
            mapTypeStr = provider;
            provider = 'google';
          }
          
          if (this.webGLEnabled){
            //do your stuff webglearth
            return mapTypeStr;
          }
          
          switch (provider){
            case 'google':
              switch (mapTypeStr) {
                case 'roadmap':
                  return google.maps.MapTypeId.ROADMAP;
                case 'satellite':
                  return google.maps.MapTypeId.SATELLITE;
                case 'hybrid':
                  return google.maps.MapTypeId.HYBRID;
                case 'terrain':
                default:
                  return google.maps.MapTypeId.TERRAIN;
              }
              break;
            case 'bing':
              break;
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
        refresh: function(callback) {
          var self = this, coords;
          
          if (self.webGLEnabled){
            ///
          }
          else{
            self.refreshClassic(callback);
          }
        },
        /**
        * Refresh 2D Map
        * @function
        * @param {Function} callback
        **/
        refreshClassic:function(callback){
          var self=this;
          if (self.refreshMarkers) {
            self.refreshMarkers = false;
            //first, clear all existing markers
            _.each(self.map.markers, function(marker) {
              marker.setMap(null);
              delete marker;
            });
            self.map.markers = [];
            //now, retrieve data & pin events on the map
            _.each(self.data, function(item) {
              if (item.lat && item.lng) {
                coords = new google.maps.LatLng(item.lat, item.lng);
                tmp_marker = new google.maps.Marker(_.extend(self.getMarkerOptions(), {
                  map: self.map,
                  position: coords,
                  title: item.title
                }));
                google.maps.event.addListener(tmp_marker, 'mouseup', function(ev) {
                  self.publish('select', item);
                });
                self.map.markers.push(tmp_marker);
                self.mapBounds.extend(coords);
              }
            });
          }
          
          google.maps.event.trigger(self.map, 'resize');
          if (self.map.markers && self.map.markers.length > 0) {
            self.map.fitBounds(self.mapBounds);
          }
          else {
            self.setCenter({lat:self.mapOptions.center.lat(), lng:self.mapOptions.center.lng()});
          }
         
          this.publish('afterRefresh');

          if (callback) callback();
        },
        /**
        * Get center
        * @function
        * @return {Object} center ({lat: , lng:})
        **/
        getCenter:function(){
          var center;
          if (this.webGLEnabled){
            center = this.map.getPosition();
            return {lat:center[0], lng:center[1]};
          }
          else{
            center = this.map.getCenter();
            return {lat:center.lat(), lng:center.lng()};
          }
        },
        /**
        * Set center
        * @function
        * @param {Object} {lat: , lng:}
        **/
        setCenter:function(location){
          if (this.webGLEnabled){
            //
          }
          else{
            this.map.setCenter(this.getCoords(location));
          }
        },
        /**
        * Returns current zoom level
        * @function
        * @return {int} zoom level
        **/
        getZoom:function(){
          if (this.map){
            return this.map.getZoom();
          }
          return 0;
        },
        /**
        * set zoom level
        * @function
        * @param {int} zoom level
        **/
        setZoom:function(zoom){
          if (this.map){
            return this.map.setZoom(zoom);
          }
          return null;
        },
        /** relative change of zoom level
        * @function 
        * @param {int} relative change
        **/
        changeZoom:function(step){
          var self = this;
          var min = 0;
          var max = 15;
          var actual=self.getZoom();
          
          var newZoom = actual+step;
          
          if (newZoom< min) newZoom=min;
          if (newZoom > max) newZoom=max;
          
          self.setZoom(newZoom);
          
        },
        /**
        * Pan to a specific location
        * If point is in bounds, move smoothly
        * else ... juste change center
        * @function
        * @param {Object} location (lat, lng)
        **/
        panTo:function(location){
          var self=this;
          if (!location || !location.lat || !location.lng){
            return false;
          }
          self.map.panTo(self.getCoords(location));
          return true;
        },
         /** Map GMaps new google.maps.latLng function
          * @function
          * @param {float} lat
          * @param {float} lng
          * @param {Object} location (lat, lng)
          **/
          getCoords:function(location){
            if (this.webGLEnabled){
                return [location.lat, location.lng];
            }
            else{
              return new google.maps.LatLng(location.lat, location.lng);
            }
          },
          /** Add a marker
          * @function
          * @param {Object} location (lat, lng)
          */
          addMarker:function(location){
            var self=this;
            
            if (!self.map){
              return false;
            }
            
            var latLng = self.getCoords(location);
            if (!self.markers){
              self.markers = [];
            }
            var marker;
            if (self.webGLEnabled){
              marker=self.addMarkerWebGL(self.map, latLng);
            }
            else{
              marker=self.addMarkerClassic(self.map,latLng);
            }
            
            self.markers.push(marker);
            return marker;
          },
          addMarkerClassic:function(map,latLng){
            var marker =  new google.maps.Marker({position:latLng});
            marker.setMap(map);
            return marker;
          },
          addMarkerWebGL:function(map,latLng){
            return map.initMarker(latLng[0], latLng[1]);
          },
          /** Clear Google maps markers 
          * @function
        ¨*/
          clearMarkers:function(){
            var self=this;
            if (!self || !self.markers){
              return false;
            }
            _.each(self.markers, function(marker){
              self.removeMarker(marker);
            });
            return true;
          },
          /**
          * Remove a specific marker from the map
          **/  
          removeMarker:function(marker){
            var self=this;
            
            if (self.webGLEnabled){
              marker.detach();
            }
            else{
              //classic
              marker.setMap(null);
            }
          },
         /***
          * We had issues google.maps.LatLngBounds.contains(LatLngBounds), so built our own implementation
          * @function
          * @param {Object} location (lat, lng)
          * @return {bool} isInBounds
          **/
          isInBounds:function(location){
            var self = this;

            var map = self.map;
            var latLng = self.getCoords(location);
            
             var bounds = new google.maps.LatLngBounds(map.getBounds().getSouthWest(), map.getBounds().getNorthEast());

              var latInBounds = latLng.lat()>=map.getBounds().getSouthWest().lat() && latLng.lat()<=map.getBounds().getNorthEast().lat();
              if (!latInBounds){
                return false;
              }

              //latitude ok, check longitude now
              var lngInBounds=false;
              var lngEast = map.getBounds().getNorthEast().lng();
              var lngWest = map.getBounds().getSouthWest().lng();
              var lngTarget = latLng.lng();

              //weird getBounds() result ?? west & east inverted when across greenwich. More min/max than west/east
              if ((lngEast <0 && lngEast >-180) &&  (lngWest>0 && lngWest<180)){
                var tmp=lngEast;
                lngEast=lngWest;
                lngWest=tmp;
              } 


              //Translate longitudes on 0->360, easier to deal with than 0->180/-180->0
             if (lngEast < 0) lngEast+=360;
             if (lngWest < 0) lngWest+=360;
             if (lngTarget < 0) lngTarget+=360;


              if (lngEast>lngWest){
                //classic east.lng > west.lng => target.lng should be between west & east
                lngInBounds = lngTarget>=lngWest &&lngTarget<=lngEast;
              }
              else{
                //across greenwich
                //target.lng should be between lngWest & 360 OR between 0 & lng East
                lngInBounds = (lngTarget>180 && lngTarget>=lngWest) || (lngTarget<=180 && lngTarget<=lngEast);
              }

            return lngInBounds;
          },
          /** 
          * Add info window
          * @function
          * @param {Object} location (lat, lng)
          * @param {String} html
          */
          addInfoWindow:function(self, location, html){
            var latLng = self.getCoords(location);
            
            
            
            if (!self.infoWindow){
              self.infoWindow=new google.maps.InfoWindow();
            }
            self.infoWindow.setContent(html);
            self.infoWindow.setPosition(latLng);
            self.infoWindow.open(uiElement.map);
          },
          /**
          * Move map to new point
          * @function
          * @param {Object} location {city, country, lat, lng}
          * @param {Object} options
          * @param {Function} callback, to be called upon arrival
          **/
            moveToLocation:function(location, options,callback){
              if (this.webGLEnabled){
                return this.moveToLocationWebGL(location,options, callback);
              }
              else{
                return this.moveToLocationClassic(location,options,callback);
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

            moveToLocationClassic:function(location, options, callback){
              var self = this;
              options = _.extend({zoomTimer:250, minZoom:3, clearMarkers:false}, options);
              var map = self.map;
              if (options.clearMarkers){
                /* clear markers */
                self.clearMarkers(); 
              }
             // var latLng=self.getCoords(location);

              if (!self.isInBounds(location)){
                var loop= setInterval(function(){
                  if (self.isInBounds(location) || self.getZoom()<=options.minZoom){
                    clearInterval(loop);
                    self.panTo(location);
                    if (callback){
                      callback();
                    }
                    return true;
                  }
                  self.changeZoom(-1);
                  
                  return false;
                }, options.zoomTimer);
              }
              else
              {
                self.panTo(location);
                if (callback){
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
            moveToLocationWebGL:function(location, options,callback){
                var self=this;
                var lat = parseFloat(location.lat);
                var lng = parseFloat(location.lng);
                
                 if (options.clearMarkers){
                    /* clear markers */
                    self.clearMarkers(); 
                  }
                // if we are nearly at the same place we dont play the animation
              var current_position = self.getCenter();
              var delta_lat = Math.abs(lat-current_position.lat);
              var delta_lng = Math.abs(lng-current_position.lng);
              if (delta_lat < 1e-6 && 
                  delta_lng < 1e-6) {
                  callback();
                  return;
              }
         
              var duration = self.getTravelDuration(this.options.map3DOptions.travelDuration,current_position, {lat:lat, lng:lng});
              
              
              
                
                self.map.flyTo(lat, lng, this.options.map3DOptions.maxAscent, duration, this.options.map3DOptions.altitude);
                setTimeout(function() {
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
          getTravelDuration:function(min,current, next){
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
          isWebGLReady:function(){
            var ready = false;
            //webgl rendering context available ?
            if (!window.WebGLRenderingContext){
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
            
          }
  });

  return UIMap;
});