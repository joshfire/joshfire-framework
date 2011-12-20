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
        webGLReady:false,
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
            mapType:'terrain',
            enable3D:false
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
          this.options.mapOptions.center = this.getCoords(this.options.centerLatLng), 
          this.options.mapOptions.mapTypeId = this.getMapTypeId(this.options.mapType);
          
          
          return this.options.mapOptions;
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
          if (typeof google == 'undefined' || typeof google.maps=='undefined'){
            if (console && console.error){
              console.error('Do not forget to include google maps script !', typeof google =='undefined'? 'google is undefined' : google);
            }
            this.__super();
            return false;
          }
          this.mapBounds = new google.maps.LatLngBounds();
          this.mapOptions = this.getMapOptions();
          
          if (this.options.enable3D && this.isWebGLReady()){
            this.webGLReady=true;
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
          self.__super(parentElement, callback);
          
          self.options = savOptions;
          
          if (typeof google=='undefined' || typeof google.maps=='undefined'){
            return false;
          }
          
          
         // self.subscribe('afterInsert', function(){
            self.map = new google.maps.Map(
              document.getElementById(self.htmlId),
              self.mapOptions
            );
            if (self.options.autoShow) {
              self.show();
            }
          //});

          return true;
        },
        /**
        * Translate object {lat:y, lng:x} in a google maps LatLng object
        * @function
        * @param {Object} latlng {lat:y, lng:x}.
        * @return {google.maps.LatLng}
        **/
        getCoords: function(latlng) {
          return new google.maps.LatLng(latlng.lat, latlng.lng);
        },
        /**
        * Translate map type from string to google maps mapType
        * @function
        * @param {string} mapTypeStr
        * @return {google.maps.MapTypeId}
        **/
        getMapTypeId: function(mapTypeStr) {
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
            self.map.setCenter(self.mapOptions.center);
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
        * Change zoom leve
        * @function
        * @param {int} zoom level
        **/
        setZoom:function(zoom){
          if (this.map){
            return this.map.setZoom(zoom);
          }
          return null;
        },
        /**
        * Pan to a specific location
        * If point is in bounds, move smoothly
        * else ... juste change center
        * @function
        * @param {Object} location (latitude, longitude)
        **/
        panTo:function(location){
          var self=this;
          if (!location || !location.latitude || !location.longitude){
            return false;
          }
          self.map.panTo(self.getLatLng(location.latitude, location.longitude));
          return true;
        },
         /** Map GMaps new google.maps.latLng function
          * @function
          * @param {float} lat
          * @param {float} lng
          * @return {google.maps.LatLng}
          **/
          getLatLng:function(lat, lng){
            return new google.maps.LatLng(lat, lng);
          },
          /** Add a marker
          * @function
          * @param {Object} location (latitude, longitude)
          */
          addMarker:function(location){
            var self=this;
            
            if (!self.map){
              return false;
            }
            
            var latLng = self.getLatLng(location.latitude, location.longitude);
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
          * @param {Object} location (latitude, longitude)
          * @return {bool} isInBounds
          **/
          isInBounds:function(location){
            var self = this;

            var map = self.map;
            var latLng = self.getLatLng(location.latitude, location.longitude);
            
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
          * @param {Object} location (latitude, longitude)
          * @param {String} html
          */
          addInfoWindow:function(self, location, html){
            var latLng = self.getLatLng(location.latitude, location.longitude);
            
            
            
            if (!self.infoWindow){
              self.infoWindow=new google.maps.InfoWindow();
            }
            self.infoWindow.setContent(html);
            self.infoWindow.setPosition(latLng);
            self.infoWindow.open(uiElement.map);
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
