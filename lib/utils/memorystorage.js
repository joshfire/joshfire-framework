Joshfire.define([], function() {

  //memory cached
  var cache = {};
  
  return {
    set:function(key,val) {
      cache[key]=val;
    },
    get:function(key) {
      return cache[key];
    },
    clear:function() {
      cache = {};
    },
    remove:function(key) {
      delete cache[key];
    },
    disabled:false
  };

});