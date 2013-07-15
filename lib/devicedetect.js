/*globals console*/

define(['implementations', 'runtime'], function (implementations, runtime) {

  var devicedetect = {

    normalize: function (name) {
      var featureInfo = implementations[name],
          hasMultipleImpls = Object.prototype.toString.call(featureInfo) === '[object Array]',
          i, m;

      if (!hasMultipleImpls) {
        return name;
      } else {

        var trueRuntime;

        if(typeof runtime === 'function' && typeof navigator !== 'undefined' && navigator.userAgent) {
          trueRuntime = runtime(navigator.userAgent);
        } else {
          trueRuntime = runtime;
        }

        for (i = 0, m = featureInfo.length; i < m; i++) {
          var current = featureInfo[i];
          if (current.isAvailable(trueRuntime)) {
            if (current && typeof current !== 'undefined') {
              return current.implementation;
            }
          }
        }
      }

      console.log('DeviceDetect : Did not find any valid feature for : ' + name);
      return name;

    },

    load: function (name, req, load) {
      req([name], function (value) {
        load(value);
      });
    }
  };
  return devicedetect;
});