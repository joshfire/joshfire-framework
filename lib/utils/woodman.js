/*! Joshfire Framework module - Copyright 2013 Joshfire, MIT license */
/**
 * @fileOverview Exposes the Woodman library to the external world.
 *
 * The Woodman library cannot be used directly because we want Woodman calls
 * that appear throughout the modules of the Joshfire framework not to log
 * anything by default, even when Woodman is used within an app that references
 * the framework.
 *
 * This module wraps the Woodman library to silence all loggers of the
 * Joshfire framework library. Applications that want to re-enable these traces
 * simply need to override this setting within the "loggers" property of their
 * Woodman library with a logger that applies to the "joshfire.framework"
 * namespace, e.g.:
 *   {
 *     name: 'joshfire.framework',
 *     level: 'all'
 *   }
 *
 * References to this module are automatically removed by the framework
 * optimizer to save space in the generated code.
 */

define(['joshlib!utils/woodmanbase'], function (woodman) {
  /**
   * Internal function that takes a Woodman configuration as input and updates
   * it to silence all framework traces by default
   *
   * @function
   * @param {Object} config The Woodman configuration
   * @return {Object} The updated config. Note updates are made in place, so
   *  return object is effectively the same as the object provided as input
   */
  var updateConfig = function (config) {
    config = config || {};
    config.loggers = config.loggers || [];

    var i = 0;
    var found = false;
    for (i = 0; i < config.loggers.length; i++) {
      if (config.loggers[i] &&
        (config.loggers[i].name === 'joshfire.framework')) {
        found = true;
        break;
      }
    }

    if (!found) {
      config.loggers.push({
        name: 'joshfire.framework',
        level: 'off'
      });
    }

    return config;
  };

  // Pointers to the base functions
  var initialize = woodman.initialize;
  var load = woodman.load;

  // Override the initialize function to silence framework traces by default
  woodman.initialize = function (config) {
    initialize(updateConfig(config));
  };

  // Override the load function to silence framework traces by default
  woodman.load = function (config, callback) {
    load(updateConfig(config), callback);
  };

  // Return the Woodman library
  return woodman;
});