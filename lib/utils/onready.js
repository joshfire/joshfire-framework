define(['joshlib!utils/dollar'], function ($) {
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
		return function (callback) {
			return $(callback);
		};
	}
});