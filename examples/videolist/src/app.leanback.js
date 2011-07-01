/*!
 * Joshfire Framework 0.9.0
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jun 29 16:25:37 2011
 */


Joshfire.define(['./app', 'joshfire/class', 'joshfire/vendor/underscore'],
  function(App, Class,  _) {

    return Class(App, {

      setup: function(callback) {

        this.__super();

        var self = this;

        self.subscribe('afterInsert', function(ev, info) {
          var vl = self.ui.element('/videolist');
          $('#' + self.id + '__').mousemove(function () {
            //self.ui.moveTo('focus', '/videolist');
            vl.show();
            vl.hideDelayed();
          });




        });

        self.ui.element('/videolist').subscribe('fresh', function(ev, info) {
          var vl = self.ui.element('/videolist');
          vl.show();
          vl.hideDelayed();
        });
 

        self.ui.element('/videolist').subscribe('data', _.once(function(ev, data) {
          var $player = $(self.ui.element('/player').htmlEl);

/*
          var resize = function() {
            var $video = $player.find('video');
            $video.height($(window).height());
            $video.width($(window).width());
          }
          resize();
          $(window).resize(resize);
          */
        }));

        callback(null, true);
      }

    });
});
