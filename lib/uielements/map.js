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

Joshfire.define(['joshfire/vendor/underscore', 'joshfire/uielement', 'joshfire/class'], function(_,UIElement, Class) {
  /**
  * @class Map base class
  * @name uielements_map
  * @augments uielement
  */
  return Class(UIElement,
      /**
      * @lends uielements_map.prototype
      */
      {
        type: 'Map',
        refreshMarkers: true,
        map: null,
        mapBounds: null,
        webGLEnabled:false,
        webGLProxyHost:'http://data.webglearth.com/cgi-bin/corsproxy.fcgi?url=',
        /**
        * Get default options
        * @function
        * @return {Object} hash of options
        * <ul>
        * <li>hideDelay {int}: in seconds, delay before hiding. Defaults 0
        * <li>autoShow {bool}: Defaults true
        * <li>showOnFocus {bool}: Defaults true
        * <li>hideOnBlur {bool}: Defaults false
        * <li>innerTemplate {String}: element's inner template. Use underscorejs syntax. Defaults '&lt;%= htmlInner %&gt;'
        * <li>loadingTemplate {String}: displayed during loading. Defaults 'Loading...'
        * <li>template {String}: element's wrapper template. Defines element's css classes, id, .. Use underscorejs syntax<br />
        *    Default: &lt;div style="display:none;" class="josh-type-&lt;%=type%&gt; josh-id-&lt;%=id%&gt; &lt;%=htmlClass%&gt;" id="&lt;%= htmlId %&gt;" data-josh-ui-path="&lt;%= path %>"&gt;&lt;%= htmlOuter %&gt;&lt;/div&gt;
        * <li>autoRefresh {bool}: defaults true
        * <li>autoInsert {bool}: defaults true.
        * </ul>
        */
        getDefaultOptions: function() {

          var defaultOptions = {
            zoom:6,
            centerLatLng:{lat: 48.8674163, lng:2.3690762999999606},//Default center, Joshfire HQ: 100 rue de la Folie-Méricourt Paris France
            provider:'google',
            mapType:'terrain',
            enable3D:false,
            provider3D:'BING',
            mapType3D:'AerialWithLabel'
          };
          var parentDefaultOptions = this.__super();
          return _.extend({}, parentDefaultOptions, defaultOptions, this.options);
        },
        /**
        * Map Options
        * Specified in item.options, fallback on default values
        * <ul>
        * <li>options.zoom (int), Defaults 8</li>
        * <li>options.centerLatLng (object {lat:y, lng:x}), defaults to Joshfire's headquarters</li>
        * <li>options.mapType(string). Either terrain(default), roadmap, satellite or hybrid</li>
        * </ul>
        * @function
        * return {Object} hash of options
        */
        getMapOptions: function() {
          if (!this.options.mapOptions){
            this.options.mapOptions={};
          }
        
          this.options.mapOptions.zoom = this.options.zoom;
          this.options.mapOptions.center = this.getCoords(this.options.centerLatLng);
          this.options.mapOptions.mapTypeId = this.getMapTypeId(this.options.provider,this.options.mapType);
          
          return this.options.mapOptions;
        },
        /**
        * get 3D Maps specific options
        * @function
        * @return {Object} options
        **/
        getMap3DOptions:function(){

          if (!this.mapOptions){
            this.mapOptions = this.getMapOptions();
          }
            var options= {
              proxyHost:this.webGLProxyHost,
              provider:this.mapOptions.provider3D.toUpperCase() || 'BING', 
              mapType:this.mapOptions.mapType3D || 'AerialWithLabels',
              position:[
                this.options.centerLatLng.lat,
                this.options.centerLatLng.lng
              ],
              maxAscent : this.mapOptions.maxAscent3D || .3,
              altitude : this.mapOptions.altitude3D || 150000,
              travelDuration : this.mapOptions.travelDuration3D || 4000 //ms
            };
            options.providerKey = this.mapOptions.providersKeys[options.provider];
            return options;
        },
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
        /**
        * Inherits uielement.init()
        * Initialize map bounds
        * @function
        */
        init: function() {
//          this.map = {};
           if (this.options.enable3D && this.isWebGLReady()){
              this.webGLEnabled=true;
            }
            

            this.__super();
            return true;


              
          
          
        },
        /**
        * Sets the tree root associated with the element
        * @function
        * @param {String} dataPath Tree path.
        */
        setDataPath: function(dataPath) {

          //Make sure we bind to a directory
          if (!dataPath.match(/\/$/)) {
            dataPath = dataPath + '/';
          }

          this.__super(dataPath);
        },


        /**
        * Insert map in dom, inherits uielement.insert()
        * Create google.maps.Map object
        * @function
        *
        **/
        insert: function(parentElement, callback) {
          var self = this, savOptions = _.extend({},self.options);
          //force autoShow false
          //sera traité apres super.insert
          self.options.autoShow=false;
          self.__super(parentElement, function(){
            self.options = savOptions;

            if (self.webGLEnabled){
              
              Joshfire.require(['joshfire/vendor/webglearth'], function(){
                self.mapOptions = self.getMapOptions();
                
                //3D 
                var options = self.getMap3DOptions();
                
                if (self.options.autoShow) {
                    self.show();
                }
                
                
                self.map = new WebGLEarth(self.htmlId, options);
                self.map.setBaseMap(
                  self.map.initMap(WebGLEarth.Maps[options.provider], [options.mapType, options.providerKey])
                );
               
                callback();
              });
            }
            else{
              if (typeof google=='undefined' || typeof google.maps=='undefined'){
                //insert gmaps script
                Joshfire.require(['joshfire/utils/getscript'], function(getScript){
                  /* gmaps async load needs a callback in global context */
                  window.gmapsCallback = function(){
                    self.initGMaps(callback);
                  }
                  
                  getScript('http://maps.google.com/maps/api/js?sensor=false&callback=gmapsCallback', function(){
                  
//                    self.initGMaps(callback);
                  })
                });
                
              }
              else{
                self.initGMaps(callback);
              }
            }
            return true;
          });
          
          return true;
        },
        initGMaps:function(callback){
          delete window.gmapsCallback;
          var self=this;
          self.mapOptions = self.getMapOptions();
          
            self.mapBounds = new google.maps.LatLngBounds();
            self.mapOptions = this.getMapOptions();
            
            //classic 2D google maps
            self.map = new google.maps.Map(
              document.getElementById(self.htmlId),
              self.mapOptions
            );
            if (self.options.autoShow) {
              self.show();
            }
            callback();
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
        * The name tells it all
        * @function
        * @params {Array} data
        */
        setData: function(data) {
          var self = this;
          data = _.map(data, function(item) {
            return {
              id: item.id,
              title: item.title,
              img: item.image,
              text: item.label,
              lat: item.lat || null,
              lng: item.lng || null
            };
          });
          if (data.length > 0) {
            self.refreshMarkers = true;
          }
          self.__super(data);
        },
        /**
        * Toggle map's loading state.
        * @function
        * param {bool} isLoading
        */
        setLoading: function(isLoading) {
          this.setState('loading', isLoading);
        },
        /**
        * Show the map. Resize it if needed, according to markers' location
        * @function
        */
        show: function() {
          var self = this;
          self.publish('beforeShow', null, true);
          self._show();
          self.refresh();
          self.publish('afterShow');
          self.showHideSwitch.off();
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
            var marker = new google.maps.Marker({
                position: latLng
            });
            marker.setMap(self.map);
            self.markers.push(marker);
            return marker;
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
              marker.setMap(null);
            });
            return true;
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
                /** ,nothing here yet **/
                var options3D = _.extend({}, this.getMap3DOptions(), options);
                var lat = parseFloat(location.lat);
                var lng = parseFloat(location.lng);
                
                
                // if we are nearly at the same place we dont play the animation
              var current_position = this.getCenter();
              var delta_lat = Math.abs(lat-current_position.lat);
              var delta_lng = Math.abs(lng-current_position.lng);
              if (delta_lat < 1e-6 && 
                  delta_lng < 1e-6) {
                  callback();
                  return;
              }
              
                
                this.map.flyTo(lat, lng, options3D.maxAscent, options3D.travelDuration, options3D.altitude);
                setTimeout(function() {
                    callback();
                }, options3D.travelDuration);
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
});
