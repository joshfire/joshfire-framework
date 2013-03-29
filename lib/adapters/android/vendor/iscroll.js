define([
	"joshlib!vendor/underscore",
	"joshlib!vendor/iscroll-lite"
], function(_, iScroll) {

	var myScroll = function(el, options) {
		iScrollObj = new iScroll(el, options);
		return _.extend(iScrollObj, {
			myScroll: true,
			refresh: function() {
				console.log(this);
				iScroll.prototype.refresh.call(this);
				if (this.options.onRefresh) this.options.onRefresh.call(this);
			}
		});
	};

	window.iScroll = myScroll;

	return myScroll;

});