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
          return {
            zoom: this.options.zoom || 8,
            center: this.getCoords(this.options.centerLatLng || {lat: 48.86799119545209, lng: 2.3347586524423702}), //center of the world: 16 rue Gaillon Paris
            mapTypeId: this.getMapTypeId(this.options.mapType || 'terrain')
          };
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
          this.mapBounds = new google.maps.LatLngBounds();
          this.__super();
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
        insert: function() {
          this.__super();
          this.mapOptions = this.getMapOptions();
          this.map = new google.maps.Map(
              document.getElementById(this.htmlId),
              this.mapOptions
              );
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
        * Html container for the map
        * @function
        * @return {string} &lt;div /&gt;.
        *
        */
        getHtml: function() {
          return '<div style="display:none;" class="josh-type-' + this.type + '" id="' + this.htmlId + '"></div>';
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
          if (self.map.markers && self.map.markers.length > 0) {
            self.map.fitBounds(self.mapBounds);
          }
          else {
            self.map.setCenter(self.options.center);
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
        }
      });
});
