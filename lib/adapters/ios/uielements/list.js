/*!
 * Joshfire Framework 0.9.1
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jul 20 20:23:43 2011
 */

Joshfire.define(['joshfire/adapters/android/uielements/list', 'joshfire/class', 'joshfire/vendor/underscore'], function(List, Class, _) {
  /**
  * @class List implementation for iOS
  * @name adapters_ios_uielements_list
  * @augments adapters_android_uielements_list
  */

  // We temporarily use the very same as on Android but moving to Scrollability and supporting
  // the new iOS5 'native' scrolling is planned.
  return List;
});
