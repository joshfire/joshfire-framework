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

Joshfire.define(['joshfire/vendor/underscore', 'joshfire/adapters/browser/uielement', 'joshfire/class'], function(_,UIElement, Class) {
  /**
  * Samsung TV adapter uses Google Static Maps API: http://code.google.com/apis/maps/documentation/staticmaps/
  * @class Static map adapter for Samsung TV
  * @name adapters_samsungtv_uielements_map
  * @augments adapters_browser_uielement
  */
  return Class(UIElement,
      /**
      * @lends adapters_samsungtv_uielements_map.prototype
      */
      {

        baseUrl: 'http://maps.google.com/maps/api/staticmap',
    	/**
     * Map Options
     * Specified in item.options, fallback on default values
     * <ul>
     * <li>options.zoom (int), Defaults 8</li>
     * <li>options.centerLatLng (object {lat:y, lng:x}), defaults to Joshfire's headquarters</li>
     * <li>options.mapType(string). Either terrain(default), roadmap, satellite or hybrid</li>
     * <li>options.width(int). Map's width, mandatory for the static maps api. Max 640</li>
     * <li>options.height(int). Map's height, mandatory for the static maps api. Max 640</li>
     * </ul>
     * @function
     * return {Object} hash of options
     */
        getMapOptions: function() {
		return {
			zoom: this.options.zoom || 8,
			center: this.getCoords(this.options.centerLatLng || {lat: 48.86799119545209, lng: 2.3347586524423702}), //center of the world: 16 rue Gaillon Paris
			sensor: this.options.sensor || false,
			size: (this.options.width ? Math.min(this.options.width, 640) : 640)
			    + 'x' + (this.options.height ? Math.min(this.options.height, 640) : 640), //max allowed by google : 640x640
			maptype: this.options.mapType || 'terrain'
		};
	},
	/**
 * Default markers options
 * @function
 * @return {Object} hash of options.
 */
	getDefaultMarkerOptions: function() {
	  return {
	    color: 'blue'
	  };
	},
        /**
        * @function
        * @param {Object} parentEl
        */
        insert: function(parentEl) {
          //    this.options =	_.extend(this.getDefaultOptions(), this.options);
		this.__super(parentEl);
		$('#' + this.htmlId).html('');

	},
	/**
 * @function
 */
	refresh: function() {
	  this.__super();
	  this.showMapImg();
	},
	/**
 * Call to google api with desired map options & markers locations
 * @function
 * @return {string} url.
 */
	getStaticImgUrl: function() {

          var self = this,
              params = self.getMapOptions();
          if (self.data && self.data.length) {
            //markers
            var tmpMarker;
            params.markers = [];
            _.each(self.data, function(item) {
              tmpMarker = _.extend({}, self.getDefaultMarkerOptions(), self.options.markerOptions);
			 	if (item.lat && item.lng) {
			 	  tmpMarker.location = item.lat + ',' + item.lng;
				}
				else if (item.location) {
				  tmpMarker.location = item.location;
				}
				params.markers.push(tmpMarker);
			});



		  //we want to see every marker
		  //forget about center & zoom, let google handle that

		  //beware! too many markers = url too long = 414 error = no map :-(
		  //We ll stick to the first 30 markers
		   delete params.center;
		   delete params.zoom;
		   params.markers = params.markers.slice(0, 40);
          }
	  else {
	    //no markers : center+zoom
	  }
	  return self.baseUrl + '?'
	        + _.map(params, function(val,key) {
	          if (_.isArray(val)) {
	            var tmp = _.map(val, function(item) {
	              return key + '=' + _.map(item, function(val2, key2) {
	                return (key2 !== 'location' ? key2 + ':' : '') + val2;
	              }).join('%7C'); //|
	            }).join('&');
	            return tmp;
	          }
	          else {
	          return key + '=' + val;
	          }
	        }).join('&');
	},
	/**
 * Formats coords
 * @param {Object} latlng {lat:y, lng:x}.
 * @return {String} coords.
 * @ignore
 */
	getCoords: function(latlng) {
          return latlng.lat + ',' + latlng.lng;
        },
        /**
        * @function
        * @return {String} html.
        */
        getHtml: function() {
          return "<div style='display:none;' class='josh-Map' id='" + this.htmlId + "'></div>";
        },
        /**
        * Set map's data. Should have id, location or lat&lng
        * @function
        * @params {Array} data
        *
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
				lng: item.lng || null,
				location: item.location || null
			};
		});
		if (data.length > 0) {
			self.refreshMarkers = true;
		}
		self.__super(data);

	},
	/**
 * Set loading state
 * @function
 * @param {bool} isLoading
 */
	 setLoading: function(isLoading) {
          this.setState('loading', isLoading);
        },
        /**
        * @function
        */
        show: function() {
		var self = this;
		self.publish('beforeShow', null, true);
		self.showMapImg();
		self._show();
	  self.publish('afterShow');
		self.showHideSwitch.off();
        },
        /*
        * Show map
        * @function
        * @ignore
        */
        showMapImg: function() {
          $('#' + this.htmlId).html('<img src="' + this.getStaticImgUrl() + '" />');
        }
      });

});
