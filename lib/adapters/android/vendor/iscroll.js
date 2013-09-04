define([
	'joshlib!vendor/underscore',
	'joshlib!vendor/iscroll-lite'
], function(_, iScroll) {

  var _superRefresh = iScroll.prototype.refresh;

  window.iScroll = _.extend(iScroll, {
    myScroll: true
  });

  window.iScroll.prototype = _.extend(iScroll.prototype, {
    refresh: function () {
      _superRefresh.call(this);
      if (this.options.onRefresh) this.options.onRefresh.call(this);
    }
  });

  return window.iScroll;
});