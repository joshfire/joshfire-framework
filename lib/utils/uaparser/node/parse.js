/**
 * @fileOverview User-agent string parser that returns an object structure with:
 * - a "ua" property that contains information about the identified "family"
 * - an "os" property that contains information about the identified OS
 * - a "device" property that contains the name of the model
 * - a "formfactor" property that contains the formfactor to use in the Factory
 *   (i.e. one of "phone", "tablet", "tv", "desktop").
 *
 * Note that the value of each of these properties is actually an object with
 * a "family" property as we may need to complete these properties over time.
 *
 * The code is highly based on the code of the ua-parser project:
 * https://github.com/tobie/ua-parser/tree/master/js
 * (MIT or Apache license)
 */
/*global exports*/

var parsers = require('./regexes');
var formfactormapping = require('./formfactormapping');

var UA = function UA(family, major, minor, patch) {
  this.family = family || 'Other';
  this.major = major || null;
  this.minor = minor || null;
  this.patch = patch || null;
};

var OS = function OS(family, major, minor, patch, patchMinor) {
  this.family = family || 'Other';
  this.major = major || null;
  this.minor = minor || null;
  this.patch = patch || null;
  this.patchMinor = patchMinor || null;
};

var Device = function Device(family) {
  this.family = family || 'Other';
};

var FormFactor = function FormFactor(family) {
  this.family = family || 'desktop';
};

exports.parse = function (str) {
  var parser = null;
  var result = {
    ua: null,
    device: null,
    formfactor: null
  };
  var match = null;
  var i = 0;
  var length = 0;

  if (typeof str !== 'string') {
    result.ua = new UA();
    result.device = new Device();
    result.formfactor = new FormFactor();
    return result;
  }

  for (i = 0, length = parsers.user_agents_parsers.length; i < length; i++) {
    parser = parsers.user_agents_parsers[i];
    match = str.match(parser.r);

    if (match) {
      result.ua = new UA(
        parser.family ? parser.family.replace('$1', match[1]) : match[1],
        parser.major || match[2],
        parser.minor || match[3],
        parser.patch || match[4]
      );
      break;
    }
  }
  if (!result.ua) {
    result.ua = new UA();
  }

  for (i = 0, length = parsers.os_parsers.length; i < length; i++) {
    parser = parsers.os_parsers[i];
    match = str.match(parser.r);

    if (match) {
      result.os = new OS(
        parser.family ? parser.family.replace('$1', match[1]) : match[1],
        parser.major || match[2],
        parser.minor || match[3],
        parser.patch || match[4],
        parser.patchMinor || match[5]
      );
      break;
    }
  }
  if (!result.os) {
    result.os = new OS();
  }

  for (i = 0, length = parsers.device_parsers.length; i < length; i++) {
    parser = parsers.device_parsers[i];
    match = str.match(parser.r);
    if (match) {
      result.device = new Device(
        parser.device ? parser.device.replace('$1', match[1]) : match[1]
      );
      break;
    }
  }
  if (!result.device) {
    result.device = new Device();
  }

  result.formfactor = new FormFactor(
    formfactormapping.device2formfactor[result.device.family] ||
    formfactormapping.os2formfactor[result.os.family] ||
    formfactormapping.family2formfactor[result.ua.family] ||
    'desktop'
  );

  return result;
};