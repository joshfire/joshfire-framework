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

Joshfire.define(['joshfire/uielement', 'joshfire/class', 'joshfire/utils/grid', 'joshfire/vendor/jquery', 'joshfire/vendor/underscore'], function(UIElement, Class, Grid, $, _) {
  /**
  * @class Media controls for browsers (play, pause, etc.)
  * @name adapters_browser_uielements_mediacontrols
  * @augments uielement
  */
  return Class(UIElement,
      /**
      * @lends adapters_browser_uielements_mediacontrols.prototype
      */
      {
        type: 'MediaControls',
        /**
        * Media controls init, subscribe to player
        * @function
        *
        */
        init: function() {

          var self = this;

          this.initGrid();

          this.subscribeToPlayerToken = false;

          this.subscribe('afterInsert', function() {

            if (self.options.media) {
              self.app.ui.fetch(self.options.media, false, function(err, elt) {
                if (!err) self.subscribeToPlayer(elt.element);
              });

            }

            self.subscribeToInput();
          });


          self.subscribe('beforeBlur', function(ev, data) {
            $('#' + self.htmlId + ' .focused').removeClass('focused');
          });

        },

        /**
        * init the grid (prev, rewind, play, etc)
        * @function
        */
        initGrid: function() {
          var self = this;
          this.grid = new Grid({
            'grid': [
              [{
                'id': 'prev'
              }, {
                'id': 'rewind'
              }, {
                'id': 'p'
              }, {
                'id': 'forward'
              }, {
                'id': 'next'
              }]
            ],
            defaultPosition: [2, 0],
            inputSource: this,
            /**
            * @function
            * @param {Object} coords
            * @param {Object} elem
            */
            'onChange': function(coords, elem) {

              $('#' + self.htmlId + ' div.mediacontrols-controls .focused').removeClass('focused');

              if (elem.id == 'p') {
                $('#' + self.htmlId + ' .mediacontrols-play, .mediacontrols-pause, .mediacontrols-stop').addClass('focused');
              } else {
                $('#' + self.htmlId + ' .mediacontrols-' + elem.id).addClass('focused');
              }
              self.focus();
            },
            /**
            * Mediaplayer controls are usually at the end of the tree but it's just a default.
            * @function M
            * @param {String} move
            * @param {String} absMove
            */
            'onExit': function(move, absMove) {
              if (self.options.beforeGridExit) {
                return self.options.beforeGridExit(self,move,absMove);
              }
              if (absMove == 'up') {
                self.app.tree.move('focus', 'up');
              }
            },
            /**
            * @function
            * @param {Object} coords
            * @param {Object} elem
            */
            'onValidate': function(coords, elem) {

              if (elem.id == 'prev') {
                self.seekBy(-60);
              } else if (elem.id == 'rewind') {
                self.seekBy(-10);
              } else if (elem.id == 'p') {
                self.playpause();
              } else if (elem.id == 'forward') {
                self.seekBy(10);
              } else if (elem.id == 'next') {
                self.seekBy(60);
              }

            },
            'orientation': self.options.orientation || 'up'
          });

        },

        /**
        * @ignore
        *
        */
        refresh: function() {

        },

        /**
        * @function
        *
        */
        show: function() {
          this.__super();
          $('#' + this.htmlId + ' .mediacontrols-controls').stop().css({
            'opacity': 1
          }).show();
        },
        /**
        * @function
        *
        */
        hide: function() {
          this.__super();
          $('#' + this.htmlId + ' .mediacontrols-controls').hide();
        },

        /**
        * @function
        * @return {string} html.
        */
        getInnerHtml: function() {


          var buttonsHtml = (typeof this.options.buttonsTemplate !== 'undefined') ? this.options.buttonsTemplate : '<span data-josh-ui-path="' + this.path + '" data-josh-grid-id="prev" class="mediacontrols-button mediacontrols-prev joshover">׀‹</span>' + '<span data-josh-ui-path="' + this.path + '" data-josh-grid-id="rewind" class="mediacontrols-button mediacontrols-rewind joshover">«</span>' + '<span data-josh-ui-path="' + this.path + '" data-josh-grid-id="p" class="mediacontrols-button mediacontrols-play joshover">›</span>' + '<span data-josh-ui-path="' + this.path + '" data-josh-grid-id="p" style="display:none" class="mediacontrols-button mediacontrols-pause joshover">▮▮</span>' + '<span data-josh-ui-path="' + this.path + '" data-josh-grid-id="p" style="display:none" class="mediacontrols-button mediacontrols-stop joshover">■</span>' + '<span data-josh-ui-path="' + this.path + '" data-josh-grid-id="forward" class="mediacontrols-button mediacontrols-forward joshover">»</span>' + '<span data-josh-ui-path="' + this.path + '" data-josh-grid-id="next" class="mediacontrols-button mediacontrols-next joshover">›׀</span>';

          var html = '<div class="mediacontrols-controls">' + '<div class="mediacontrols-info">' + ((typeof this.options.loadingTemplate !== 'undefined') ? this.options.loadingTemplate : 'Please wait&nbsp;⋅⋅⋅') + '</div>' + '<div class="mediacontrols-buttons">' + buttonsHtml + '<span class="mediacontrols-time"><span class="mediacontrols-currenttime">00:00</span> / <span class="mediacontrols-duration">00:00</span></span></div>' + '<div class="mediacontrols-time-rail"><span class="mediacontrols-time-total"><span class="mediacontrols-time-loaded"></span><span class="mediacontrols-time-current"></span></span></div>' + '</div>';

          return html;
        },

        /**
        * @function
        *
        */
        subscribeToInput: function() {

          var self = this;

          //Only mouse for now, fixme
          var timeRail = $('#' + this.htmlId + ' .mediacontrols-time-rail');

          timeRail.live('click', function(e) {
            // console.log("seek",(e.pageX - timeRail.offset().left) / timeRail.width(),self.player.getTotalTime(),(e.pageX - timeRail.offset().left),timeRail.width());
            self.seekTo(((e.pageX - timeRail.offset().left) / timeRail.width()) * self.player.getTotalTime());
          });

        },

        /**
        * @function
        * @param {int} seconds
        */
        seekBy: function(seconds) {
          this.player.publish('input', ['seekBy', seconds]);
        },

        /**
        * @function
        * @param {int} position
        */
        seekTo: function(position) {
          this.player.publish('input', ['seekTo', position]);
        },

        /**
        * Depending of the videoStatus, play or pause the video
        * @function
        */
        playpause: function() {

          if (this.player.videoStatus == 'playing' || this.player.videoStatus == 'loading') {

            this.player.publish('input', ['pause']);

          } else if (this.player.videoStatus == 'stopped' || this.player.videoStatus == 'paused') {

            this.player.publish('input', ['play']);
          }

        },

        /**
        * Translate seconds into human-friendly time string. 3457 secs = 57:37
        * @function
        * @param {int} seconds
        * return {string}.
        */
        secondsToTimeCode: function(seconds) {
          seconds = Math.round(seconds);
          var minutes = Math.floor(seconds / 60);
          minutes = (minutes >= 10) ? minutes : '0' + minutes;
          seconds = Math.floor(seconds % 60);
          seconds = (seconds >= 10) ? seconds : '0' + seconds;
          return minutes + ':' + seconds;
        },

        /**
        * @function
        * @param {Object} elt
        */
        subscribeToPlayer: function(elt) {

          // Already subscribed ?
          if (this.player && this.player.id == elt.id) return;

          // Subscribed to another player ?
          if (this.player && this.subscribeToPlayerToken) {
            this.player.unsubscribe(this.subscribeToPlayerToken);
          }

          this.player = elt;

          var self = this;
          this.subscribeToPlayerToken = elt.subscribe('*', function(ev, data) {

            if (ev == 'error') {
              $('#' + self.htmlId + ' .mediacontrols-buttons').hide();
              $('#' + self.htmlId + ' .mediacontrols-info').html(data[1]);
              $('#' + self.htmlId + ' .mediacontrols-info').show();

            } else if (ev == 'playing') {
              $('#' + self.htmlId + ' .mediacontrols-stop ,#' + self.htmlId + ' .mediacontrols-play').hide();
              $('#' + self.htmlId + ' .mediacontrols-pause').show();

            } else if (ev == 'paused' || ev == 'stopped') {
              $('#' + self.htmlId + ' .mediacontrols-stop ,#' + self.htmlId + ' .mediacontrols-pause').hide();
              $('#' + self.htmlId + ' .mediacontrols-play').show();

            } else if (ev == 'success') {
              $('#' + self.htmlId + ' .mediacontrols-buttons').show();
              $('#' + self.htmlId + ' .mediacontrols-info').hide();

            } else if (ev == 'progress') {
              $('#' + self.htmlId + ' .mediacontrols-duration').text(isNaN(data[0].totalTime) ? '--:--' : self.secondsToTimeCode(data[0].totalTime));
              $('#' + self.htmlId + ' .mediacontrols-time-loaded').css('width', Math.round(100 * data[0].bufferedTime / data[0].totalTime) + '%');

            } else if (ev == 'timeupdate') {

              $('#' + self.htmlId + ' .mediacontrols-buttons').show();
              $('#' + self.htmlId + ' .mediacontrols-info').hide();

              $('#' + self.htmlId + ' .mediacontrols-duration').text(isNaN(data[0].totalTime) ? '--:--' : self.secondsToTimeCode(data[0].totalTime));
              $('#' + self.htmlId + ' .mediacontrols-currenttime').text(self.secondsToTimeCode(isNaN(data[0].currentTime) ? 0 : data[0].currentTime));
              $('#' + self.htmlId + ' .mediacontrols-time-current').css('width', Math.round(100 * data[0].currentTime / data[0].totalTime) + '%');

            //$("#" + self.htmlId + ' .mediacontrols-time-loaded').css('width', Math.round(100 * data[0].bufferedBytes / data[0].totalBytes) + '%');
            } else if (ev == 'ended') {
              $('#' + self.htmlId + ' .mediacontrols-stop ,#' + self.htmlId + ' .mediacontrols-pause').hide();
              $('#' + self.htmlId + ' .mediacontrols-play').show();

            } else if (ev == 'canplay') {
              $('#' + self.htmlId + ' .mediacontrols-buttons').show();
              $('#' + self.htmlId + ' .mediacontrols-info').hide();
            }
          });
        }
      });
});
