define([],function() {
	if (typeof cordova !== 'undefined') {
		// This is a limited way to check that the event has not been already fired.
		// Since usually the function the module returns is used just after the module
		// definition, it may even seem pointless...
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