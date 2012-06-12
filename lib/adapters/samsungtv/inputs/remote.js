

  console.log('test')

  define([
  'joshlib!vendor/backbone',
  'joshlib!utils/dollar',
  'joshlib!vendor/underscore'
],
function(Backbone, $, _) {

  if(typeof Common !== 'undefined') {
    var keyValues = new Common.API.TVKeyValue();

    /**
     * Set up key codes if needed.
     */
    window.VK_ENTER = keyValues.KEY_ENTER;
    window.VK_PAUSE = keyValues.KEY_PAUSE;
    //window.VK_PAGE_UP = keyValues
    //window.VK_PAGE_DOWN = keyValues
    window.VK_LEFT = keyValues.KEY_LEFT;
    window.VK_UP = keyValues.KEY_UP;
    window.VK_RIGHT = keyValues.KEY_RIGHT;
    window.VK_DOWN = keyValues.KEY_DOWN;
    window.VK_0 = keyValues.KEY_PAD_0;
    window.VK_1 = keyValues.KEY_PAD_1;
    window.VK_2 = keyValues.KEY_PAD_2;
    window.VK_3 = keyValues.KEY_PAD_3;
    window.VK_4 = keyValues.KEY_PAD_4;
    window.VK_5 = keyValues.KEY_PAD_5;
    window.VK_6 = keyValues.KEY_PAD_6;
    window.VK_7 = keyValues.KEY_PAD_7;
    window.VK_8 = keyValues.KEY_PAD_8;
    window.VK_9 = keyValues.KEY_PAD_9;
    window.VK_RED = keyValues.KEY_RED;
    window.VK_GREEN = keyValues.KEY_GREEN;
    window.VK_YELLOW = keyValues.KEY_YELLOW;
    window.VK_BLUE = keyValues.KEY_BLUE;
    window.VK_REWIND = keyValues.KEY_RW;
    window.VK_STOP = keyValues.KEY_STOP;
    window.VK_PLAY = keyValues.KEY_PLAY;
    window.VK_FAST_FWD = keyValues.KEY_FF;
    window.VK_BACK = keyValues.KEY_RETURN;
    window.VK_VOL_UP = keyValues.KEY_VOL_UP;
    window.VK_VOL_DOWN = keyValues.KEY_VOL_DOWN;
    window.VK_MUTE = keyValues.KEY_MUTE;
  }

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
  keyCodeToName[window.VK_VOL_UP] = 'vol_up';
  keyCodeToName[window.VK_VOL_DOWN] = 'vol_down';
  keyCodeToName[window.VK_MUTE] = 'mute';

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

      console.log('keydown', event.keyCode, name);

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
