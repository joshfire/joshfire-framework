/**
 * @fileOverview Exposes a short utility that returns a unique ID that can be
 * used to identify objects within the lifetime of an app.
 *
 * Note that the ID returned is NOT a GUID!
 */
define([], function () {
  var id = 0;

  return function () {
    return id++;
  };
});