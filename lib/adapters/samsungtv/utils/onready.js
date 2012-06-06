define([],function() {
  return function(callback) {
    if (/complete|loaded|interactive/.test(document.readyState)) callback();
    document.addEventListener('DOMContentLoaded', callback, false);
  };
});
