  define([
  'joshlib!vendor/backbone',
  'joshlib!utils/dollar',
  'joshlib!vendor/underscore'
],
function(Backbone, $, _) {

  /**
   * Set up key codes if needed.
   */
  window.VK_ENTER = typeof VK_ENTER !== 'undefined' ? VK_ENTER : 13;
  window.VK_PAUSE = typeof VK_PAUSE !== 'undefined' ? VK_PAUSE : 19;
  window.VK_PAGE_UP = typeof VK_PAGE_UP !== 'undefined' ? VK_PAGE_UP : 33;
  window.VK_PAGE_DOWN = typeof VK_PAGE_DOWN !== 'undefined' ? VK_PAGE_DOWN : 34;
  window.VK_LEFT = typeof VK_LEFT !== 'undefined' ? VK_LEFT : 37;
  window.VK_UP = typeof VK_UP !== 'undefined' ? VK_UP : 38;
  window.VK_RIGHT = typeof VK_RIGHT !== 'undefined' ? VK_RIGHT : 39;
  window.VK_DOWN = typeof VK_DOWN !== 'undefined' ? VK_DOWN : 40;
  window.VK_0 = typeof VK_0 !== 'undefined' ? VK_0 : 48;
  window.VK_1 = typeof VK_1 !== 'undefined' ? VK_1 : 49;
  window.VK_2 = typeof VK_2 !== 'undefined' ? VK_2 : 50;
  window.VK_3 = typeof VK_3 !== 'undefined' ? VK_3 : 51;
  window.VK_4 = typeof VK_4 !== 'undefined' ? VK_4 : 52;
  window.VK_5 = typeof VK_5 !== 'undefined' ? VK_5 : 53;
  window.VK_6 = typeof VK_6 !== 'undefined' ? VK_6 : 54;
  window.VK_7 = typeof VK_7 !== 'undefined' ? VK_7 : 55;
  window.VK_8 = typeof VK_8 !== 'undefined' ? VK_8 : 56;
  window.VK_9 = typeof VK_9 !== 'undefined' ? VK_9 : 57;
  window.VK_RED = typeof VK_RED !== 'undefined' ? VK_RED : 403;
  window.VK_GREEN = typeof VK_GREEN !== 'undefined' ? VK_GREEN : 404;
  window.VK_YELLOW = typeof VK_YELLOW !== 'undefined' ? VK_YELLOW : 405;
  window.VK_BLUE = typeof VK_BLUE !== 'undefined' ? VK_BLUE : 406;
  window.VK_REWIND = typeof VK_REWIND !== 'undefined' ? VK_REWIND : 412;
  window.VK_STOP = typeof VK_STOP !== 'undefined' ? VK_STOP : 413;
  window.VK_PLAY = typeof VK_PLAY !== 'undefined' ? VK_PLAY : 415;
  window.VK_FAST_FWD = typeof VK_FAST_FWD !== 'undefined' ? VK_FAST_FWD : 417;
  window.VK_INFO = typeof VK_INFO !== 'undefined' ? VK_INFO : 457;
  window.VK_BACK = typeof VK_BACK !== 'undefined' ? VK_BACK : 461;

  /**
   * @private
   */
  var keyCodeToName = {};

  keyCodeToName[window.VK_ENTER] = 'enter';
  keyCodeToName[window.VK_PAUSE] = 'pause';
  keyCodeToName[window.VK_PAGE_UP] = 'page_up';
  keyCodeToName[window.VK_PAGE_DOWN] = 'page_down';
  keyCodeToName[window.VK_LEFT] = 'left';
  keyCodeToName[window.VK_UP] = 'up';
  keyCodeToName[window.VK_RIGHT] = 'right';
  keyCodeToName[window.VK_DOWN] = 'down';
  keyCodeToName[window.VK_0] = '0';
  keyCodeToName[window.VK_1] = '1';
  keyCodeToName[window.VK_2] = '2';
  keyCodeToName[window.VK_3] = '3';
  keyCodeToName[window.VK_4] = '4';
  keyCodeToName[window.VK_5] = '5';
  keyCodeToName[window.VK_6] = '6';
  keyCodeToName[window.VK_7] = '7';
  keyCodeToName[window.VK_8] = '8';
  keyCodeToName[window.VK_9] = '9';
  keyCodeToName[window.VK_RED] = 'red';
  keyCodeToName[window.VK_GREEN] = 'green';
  keyCodeToName[window.VK_YELLOW] = 'yellow';
  keyCodeToName[window.VK_BLUE] = 'blue';
  keyCodeToName[window.VK_REWIND] = 'rewind';
  keyCodeToName[window.VK_STOP] = 'stop';
  keyCodeToName[window.VK_PLAY] = 'play';
  keyCodeToName[window.VK_FAST_FWD] = 'fast_fwd';
  keyCodeToName[window.VK_INFO] = 'info';
  keyCodeToName[window.VK_BACK] = 'back';

  /**
   * Remote input.
   *
   * Ex:
   *
   * var remote = new Remote();
   * remote.bind('press:back', function(event) {}, this);
   * remote.bind('release:0', function(event) {}, this);
   *
   * @class
   */
  var Remote = function() {
    _.bindAll(this, 'onKeyDown', 'onKeyUp');

    var $window = $(window);

    $window.bind('keydown', this.onKeyDown);
    $window.bind('keyup', this.onKeyUp);
  };

  _.extend(Remote.prototype, Backbone.Events, {

    /**
     * Removes event listeners.
     *
     * @function
     */
    destroy: function() {
      var $window = $(window);

      $window.unbind('keydown', this.onKeyDown);
      $window.unbind('keyup', this.onKeyUp);
    },

    /**
     * @private
     */
    onKeyDown: function(event) {

      var name = keyCodeToName[event.keyCode];
      if(typeof name !== 'undefined') {
        this.trigger('press:' + name);
      }
    },

    /**
     * @private
     */
    onKeyUp: function(event) {
      var name = keyCodeToName[event.keyCode];
      if(typeof name !== 'undefined') {
        this.trigger('release:' + name);
      }
    }
  });

  return Remote;
});
