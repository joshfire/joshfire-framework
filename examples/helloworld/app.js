/*!
 * Joshfire Framework 0.9.1
 * http://framework.joshfire.com/
 *
 * Copyright 2013, Joshfire, licensed under an MIT license
 * http://framework.joshfire.com/license
 */
/*global console*/

define([
  'joshlib!utils/dollar',
  'joshlib!utils/onready'
], function ($, onReady) {
  console.log('Initializing...');

  onReady(function () {
    $('body').html('<p>Hello world!</p>');
    console.log('Application started!');
  });
});
