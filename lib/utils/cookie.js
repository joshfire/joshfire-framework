define(['joshlib!vendor/underscore'], function(_){

return function (name, data, options) {
       if (arguments.length > 1 && String(data) !== "[object Object]") {
           options = _.extend({}, options);
           if (data === null || data === undefined) options.expires = -1;
           if (typeof options.expires == "number") {
               var d = options.expires, e = options.expires = new Date;
               e.setDate(e.getDate() + d);
           }
           data = String(data);
           return document.cookie = [encodeURIComponent(name), "=", options.raw ? data : encodeURIComponent(data), options.expires ? "; expires=" + options.expires.toUTCString() : "", options.path ? "; path=" + options.path : "", options.domain ? "; domain=" + options.domain : "", options.secure ? "; secure" : ""].join("");
       }
       options = data || {};
       var f, g = options.raw ? function(name) {return name;} : decodeURIComponent;
       return (f = (new RegExp("(?:^|; )" + encodeURIComponent(name) + "=([^;]*)")).exec(document.cookie)) ? g(f[1]) : null;
   };
});