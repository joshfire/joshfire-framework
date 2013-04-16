define([],function() {
	if (typeof cordova !== 'undefined') {
		var cordovaDeviceReady = false;
		document.addEventListener('deviceready', function () {
			cordovaDeviceReady = true;
		}, false);
		return function (callback) {
			if (cordovaDeviceReady) return callback();
			document.addEventListener('deviceready', callback, false);
		};
	} else {
		return function(callback) {
			if (/complete|loaded|interactive/.test(document.readyState)) return callback();
			document.addEventListener('DOMContentLoaded', callback, false);
		};
	}
});