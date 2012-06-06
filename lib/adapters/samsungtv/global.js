(function(J) {

  //todo !joshfire
  J.onReady = function(f) {
    J.require(['joshfire/vendor/zepto'], function($) {
      //      $(f);
      f.call();
    });
  };


})(Joshfire);
