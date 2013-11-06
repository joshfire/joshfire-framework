define([
  'joshlib!vendor/underscore',
  'joshlib!vendor/iscroll-lite'
], function(_, IScroll) {

  var _superRefresh = IScroll.prototype.refresh;

  IScroll = _.extend(IScroll, {
    myScroll: true
  });

  IScroll.prototype = _.extend(IScroll.prototype, {
    refresh: function () {
      _superRefresh.call(this);
      if (this.options.onRefresh) this.options.onRefresh.call(this);
    }
  });

  return IScroll;
});