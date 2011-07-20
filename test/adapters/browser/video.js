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

// ----------------------------------------------------------------------------
// documentation on writing tests here: http://docs.jquery.com/QUnit


var Q = QUnit;
Q.config.autostart = false;


var J = Joshfire;

J.debug = true;
J.require(['joshfire/app', 'joshfire/class', 'joshfire/uielements/video'], function(App,Class,Video) {

  J.UI = { 'Video': Video };
  J.Apps = {};


  var events = [];
  var ended = function() {
    events.push('ended');
    console.log('ended');
  };

  var canplay = function() {
    events.push('canplay');
    console.log('canplay');
  };

  var error = function() {
    events.push('error');
    console.log('error');
  };

  var timeupdate = function() {
    events.push('timeupdate');
    console.log('timeupdate');
  };


  J.Apps.VideoTest = Class(App, {
    init: function(callback) {
      this.player = new J.UI.Video(this, 'vplayer', {
        maximise: true,
        'autoInsert': true,
        'defaultPlayer': true,
        'persistFocus': false,
        'orientation': 'down',
        'menuRoot': /video/,
        'canplay': canplay,
        'ended': ended,
        'loadingTemplate': '<p>Loading</p>',
        'error': error,
        'timeupdate': timeupdate
      });
      callback();
    },

    start: function(baseHtmlId) {
      var self = this;
      this.init(function() {
        self.setBaseHtmlId(baseHtmlId);
        self.setBaseUIElement(self.player);
        self.insert();
        self.player.show();
      });
    }
  });

  Q.start();

});


// ----------------------------------------------------------------------------


Q.module('Joshfire tests: video');


Q.test('Joshfire installation', function() {

  Q.expect(2);

  var myapp = new J.Apps.VideoTest();

  Q.equals(typeof window.Joshfire, 'object', 'Joshfire() declared');

  Q.equals(typeof myapp.menu, 'object', 'Joshfire.Menu() instantiated');

});


// ----------------------------------------------------------------------------


Q.test('videos', function() {

  Q.expect(32);

  //Q.equals(testee2.index,{},'index d\'origine');

  var myapp = new J.Apps.VideoTest();

  myapp.start('qunit-appcontainer');

  myapp.player.play({
    'url': 'http://video.ted.com/talks/podcast/AlGore_2006_480.mp4'
  });

  Q.stop();

  setTimeout(function() {

    myapp.player.play({
      'url': 'http://video.ted.com/talks/embed/BrianCox_2008-embed_high.flv'
    });

    setTimeout(function() {

      myapp.player.play({
        'url': 'rtmp://stream2.france24.yacast.net/france24_live/en/f24_liveen',
        'mime': 'video/flv'
      });

      Q.start();

    }, 5000);

  }, 5000);


});
