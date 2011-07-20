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

Joshfire.define(
    ['joshfire/class', 'joshfire/adapters/browser/uielements/video.mediaelement'],
    function(Class, VideoMediaElement) {
      /**
      * @class
      * Video player for the Samsung TV
      * @name adapters_samsungtv_uielements_video.mediaelement
      * @augments adapters_browser_uielements_video.mediaelement
      * @augments mixins_pubsub
      * @example
      * Joshfire.define(
      * ['lib/uielements/video.mediaelement'],
      * function(Video) {
      *	// plays a non protect H.264 file
      * 	Video.play('http://example.org/video/file.mp4')
      *	// plays a video with DRM management
      *	Video.play( {
      *		DRMType:'HLS', // could be HLA
      *		url:'http://example.org/video/fileWithToken.m3u8'
      *	});
      *	// listen to download or play events
      *	Video.subscribe('error', function() {
      *	});
      *
      *	Video.subscribe('loading', function() {
      *		// buffering, should display an indicator
      *	});
      *	Video.subscribe('playing', function() {
      *		// update the play/pause button state
      *	});
      *	Video.subscribe('timeupdate', function(args) {
      *		console.log(args.currentTime, args.totalTime);
      *	})
      * }
      *);
      */

      return Class(VideoMediaElement, /** @lends adapters_samsungtv_uielements_video.mediaelement.prototype */{

        /**
        * Init video
        */
        init: function() {

          //	console.log('samsungtv/video.mediaelement init');

          if (!window.samsungJoshfire
        || !samsungJoshfire.oVideoElement
        || !samsungJoshfire.oVideoElement.oElement
        || !samsungJoshfire.oVideoElement.oElement.nodeName
        || samsungJoshfire.oVideoElement.oElement.nodeName.toUpperCase() !== 'OBJECT') {
            return this.publish('error',
                { message: 'samsungtv VideoMediaElement : no URL given',
                  number: 21,
                  origin: 'adapters/samsungtv/ui/video.mediaelement'
                });
          //throw new Error('Samsung video object not found');
          } else {
            // pointer to the Video Plugin of Samsung.
            // 2.3 SDK supports only one video display at a time
            this._samsungPlayer = samsungJoshfire.oVideoElement.oElement;
            //console.log(this._samsungPlayer, samsungJoshfire.oVideoElement.oElement, J.JSON.stringify(samsungJoshfire.oVideoElement) );
            // save the TV source
            //samsungJoshfire.oVideoElement.oElementWindowSource = samsungJoshfire.oVideoElement.oElementWindow.GetSource();
            // switch off the source (real TV, HDMI1 ...) if the TV is not already displaying the video from the application
            //console.warn('QSDMLFJQSMLDFJK');
            /*console.log(samsungJoshfire.oVideoElement);
            console.log(samsungJoshfire.oVideoElement.oElementWindow);
            console.log(samsungJoshfire.oVideoElement.oElementWindow.PL_WINDOW_SOURCE_MEDIA);
            */
            //console.log('VIDEO source :'+samsungJoshfire.oVideoElement.oElementWindow.GetSource());

            //if(samsungJoshfire.oVideoElement.oElementWindow.PL_WINDOW_SOURCE_MEDIA != samsungJoshfire.oVideoElement.oElementWindow.GetSource()) {
        	//console.warn( samsungJoshfire.oVideoElement.oElementWindow.GetSource() );
        	//samsungJoshfire.oVideoElement.oElementWindow.SetSource( samsungJoshfire.oVideoElement.oElementWindow.PL_WINDOW_SOURCE_MEDIA );
            //}
            console.log(samsungJoshfire.oVideoElement.oElement);
          }

          /*if(this.bListenToMultimediaKeys === true) {
          this.handleInputEvent();
          }*/

          this.initVariables();
          // already set in the __super method
          //this.setVideoStatus("stopped");
          this.ticking = false;

          this.subscribe('afterShow', function() {
            if (!self.ticking) {
              self.ticking = true;
              self.tick();
            }
          });

          this.subscribe('afterHide', function() {
            self.ticking = false;
          });

			// from here, listen to the video events. Samsung player does not provide real DOM events, so the addEventListener method does not work
			var self = this;
			// must listen to the 'playing' event in order to catch the time update
			/**
   * @ignore
   */
			samsungJoshfire.oVideoElement.OnCurrentPlayTime = function(iMilliSeconds) {
				//console.log('VIDEO'
				// warning : this can be called one last time after the video has been stopped
				if (self.videoStatus == 'stopped') {
					//console.log('VIDEO', self.videoStatus, iMilliSeconds);
					return;
				}

				//console.log('OnCurrentPlayTime '+ iMilliSeconds );
				self.currentTime = iMilliSeconds;
				// warning 2 : when the video is in error, samsung player continue to call this method anyway
				if (self.errorCode == 0) {
					self.tick();
				}
			};
			/**
   * @ignore
   */
			samsungJoshfire.oVideoElement.OnRenderError = function(e ) {
				console.log('VIDEO OnRenderError ' + e);
				if (e > 0) {
					/* From Samsung doc :
     Parameter value of OnRenderError means as follow;
     1 : Unsupported container
     2 : Unsupported video codec
     3 : Unsupported audio codec
     4 : Unsupported video resolution
     */
				self.errorCode = 3; // corresponds to MEDIA_ERR_DECODE
				// there is 2 undocumented errors :
				//   0 is thrown when :
				//		- switching too fast of video
				//		- when previous video was an error
				//		- when given URL was undefined
				//   -1 seems to be throwned when trying to play .flv videos for the first time (instead of code 2)
				} else if (e < 0) {
					self.errorCode = e;
				} else if (e == 0
					&& (typeof self.videoURL == 'string')) {
					self.errorCode = 2;
				}

				// sometimes, the samsung video player crashes and throws the errorCode 2 (video not readable) and 3 (audio not readable)
				// but if the OnBufferingComplete is called, that means that the video is readable, so we try to re-run the video
				if (self.metaDataReceived === true
					&& e == 2) {
					console.log('VIDEO restart');
					self._samsungPlayer.Stop();
					self._samsungPlayer.InitPlayer(self.videoURL);
					var bIsAlright = self._samsungPlayer.StartPlayback();
					console.log('VIDEO restart ' + bIsAlright);
				} else {
					self.error();
				}
			};
			/**
   * @ignore
   */
			samsungJoshfire.oVideoElement.OnStreamNotFound = function() {
				console.log('VIDEO ERROR OnStreamNotFound');
				self.errorCode = 2; // corresponds to MEDIA_ERR_NETWORK
				self.error();
			};
			/**
   * @ignore
   */
			samsungJoshfire.oVideoElement.OnConnectionFailed = function() {
				console.log('VIDEO ERROR OnConnectionFailed');
				self.errorCode = 2; // corresponds to MEDIA_ERR_NETWORK
				self.error();
			};
			/**
   * @ignore
   */
			samsungJoshfire.oVideoElement.OnNetworkDisconnected = function() {
				console.log('VIDEO ERROR OnNetworkDisconnected');
				self.errorCode = 2; // corresponds to MEDIA_ERR_NETWORK
				self.error();
			};

			// when video is lagging, buffering can be called many times during play

			/**
   * warning : from time to time, OnBufferingProgress is called before OnBufferingStart
   * @ignore
   */
			samsungJoshfire.oVideoElement.OnBufferingProgress = function() {
				/*console.log('VIDEO OnBufferingProgress');
    self.setVideoStatus("loading");
    */
			};
			/**
   * @ignore
   */
			samsungJoshfire.oVideoElement.OnBufferingStart = function() {
				/*if(self.videoStatus != 'loading') {
    self.previousVideoStatus = self.videoStatus;
    }
    */
				console.log('VIDEO OnBufferingStart');
				self.setVideoStatus('loading');
			};
			/**
   * @ignore
   */
			samsungJoshfire.oVideoElement.OnBufferingComplete = function() {
				console.log('VIDEO OnBufferingComplete');
				// set back to "playing" or whatever status
				//self.setVideoStatus( self.previousVideoStatus );
				//self.publish('canplay');
				// buffering events are received only if the play method has been launched, so we suppose
				self.setVideoStatus('playing');
				//self.publish('playing');
			};

          /**
          * @ignore
          */
			// OnRenderingComplete = when the video reaches the end of the stream
			samsungJoshfire.oVideoElement.OnRenderingComplete = function() {
				console.log('VIDEO OnRenderingComplete');
				//self.setVideoStatus("stopped");
				// warning : when this event is fired, the video is not always stopped (in the TV, not in the emulator)
				// so we stop it manually
				self.stop();
				self.publish('ended');
				self.playNext();
			};

			/**
   * @ignore
   */
			samsungJoshfire.oVideoElement.OnStreamInfoReady = function() {
				self.metaDataReceived = true;
				console.log('VIDEO OnStreamInfoReady :' + self._samsungPlayer.GetDuration());
				self.iDuration = self._samsungPlayer.GetDuration();
			};

          // stops the video when the application is exited
          window.addEventListener('unload', function() {
            console.log('unload');
            this.remove.call(this);
          }, false);

          this.__super();
        },
        tick: function() {
			console.log('VIDEO tick ' + this.currentTime);
			if (this.currentTime === this.iLastCurrentTime)
				return;
			this.setVideoStatus('playing');
			this.publish('timeupdate',
				[{
						currentTime: Math.round(this.currentTime / 1000),
						totalTime: Math.round(this.getTotalTime() / 1000)
					}]);
			this.iLastCurrentTime = this.currentTime;
		},
		/**
  * seems useless : by default, the video run in fullscreen in the background
  */
		enterFullscreen: function() {
			console.log('samsungtv/video.mediaelement setFullscreen');
			this.setDimension(0, 0, window.innerWidth, window.innerHeight);
			//samsungJoshfire.widgetAPI.setOffScreenSaver();
		},
		/**
  * @function
  * seems useless : by default, the video run in fullscreen in the background
  * @param iX {integer} horizontal postion of the top left corner.
  * @param iY {integer} horizontal postion of the top left corner.
  * @param iWidth {integer} width.
  * @param iHeight {integer} height.
  */
		setDimension: function(iX, iY, iWidth, iHeight ) {
			return;
			// be careful not to display any pixel of the video out of the screen, or it crashes Samsung
			iX	= Math.min(window.innerWidth - 1, iX);
			iY	= Math.min(window.innerHeight - 1, iY);
			iWidth	= Math.min((window.innerWidth - iX), iWidth);
			iHeight	= Math.min((window.innerHeight - iY), iHeight);

			// preserve ratio with the biggest dimension
			var iRatio = this._samsungPlayer.GetVideoWidth() / this._samsungPlayer.GetVideoHeight();
			console.log(typeof this._samsungPlayer.GetVideoWidth(), this._samsungPlayer.GetVideoWidth(), typeof this._samsungPlayer.GetVideoHeight(), this._samsungPlayer.GetVideoHeight());
			// check that we obtained something we can deal with
			if ((typeof iRatio) === 'number'
				&& iRatio > 0) {
				// preserve ratio
				if (iWidth > iHeight) {
					iHeight = iWidth / iRatio;
				} else {
					iWidth = iRatio * iHeight;
				}
			}
			console.log('ratio : ' + iRatio);
			/*var bReduceHeight = iRatio *
   iRatio
   if(
   */
			/*this._samsungPlayer.GetVideoWidth()
   this._samsungPlayer.GetVideoHeight()
   */
			try {
				bIsAlright = this._samsungPlayer.SetDisplayArea(iX, iY, iWidth, iHeight);
			} catch (e) {
				console.log('VIDEO error ' + e);
				bIsAlright = false;
			}
			if (bIsAlright != true) {
				this.errorCode = 16;
				this.error();
			}
		},
		//GetVideoHeight
        /**
        * @deprecated rather use .play().
        * @see adapters_samsungtv_uielements_videoMediaElement#play
        */
        playWithStaticUrl: function(options) {
			/*console.log('playWithStaticUrl');
   console.log( options );
   */
  			/*options.config.clip.scaling
     options.config.clip.url
     options.config.canvas.playlist.autoPlay
     */
			// the parameter given to this method should be a String, but for retrocompatibility reasons, we test other possible locations of the URL
			if (typeof options === 'string') {
			    this.videoURL = options;
			} else if (options.url) {
			    this.videoURL = options.url;
			} else if (options.config
				    && options.config.clip
				    && options.config.clip.url) {
				this.videoURL = options.config.clip.url;
			}
          if (!this.videoURL) {
				this.errorCode = 21;
				return this.error();
			}
			// we give the format to Samsung Player by adding a fake parameter to the url given to the player
			// the param is not sent to the server
			if (options.DRMType) {
			  if (options.DRMType === 'HLS'
			    || options.DRMType === 'HLA') {
			    this.videoURL += '|COMPONENT=' + options.DRMType;
			  } else {
			    throw new TypeError('wrong DRM format given');
		    }
			}
			//console.log(''samsungtv/video.mediaelement version : '+this._samsungPlayer.GetPlayerVersion() );

			/*
   var oVideoList = [
   'http://benoit.myskreen.typhon.net/vimeo.mp4',
   'http://viphttp.yacast.net/lbafilmo/prod/elts/programmes/2182/uzik/extra/2182_ba_XL.flv',
   'http://http.canalplay.com/wmvroot/16912/16912_600p.mp4',
   'http://ba.vod.n9uf.net//NEUF/p/a/t/VOD6470trailer_web-pathe_centurion_trailer.mp4',
   'http://ba.vod.n9uf.net//NEUF/s/n/d/VOD7016trailer_web-snd_skyline_hd_fa.mp4',
   'http://http.canalplay.com/wmvroot/17265/17265_600p.mp4',
   'http://dl.paristream.net/69884c23-9f0c-4548-bf70-c8161d157414/Aw59PiKf.mp4', // 320x180@300kbps
   'http://dl.paristream.net/69884c23-9f0c-4548-bf70-c8161d157414/w2C3JzXj.mp4', //512x288@700kbps
   'http://dl.paristream.net/69884c23-9f0c-4548-bf70-c8161d157414/Cs6r9Z5J.mp4', // 720x400@1100kbps
   'http://dl.paristream.net/69884c23-9f0c-4548-bf70-c8161d157414/d5Y3KtCg.mp4', // 720p@1800kbps
   'http://dl.paristream.net/69884c23-9f0c-4548-bf70-c8161d157414/Pc8n6LFj.mp4' // 1080p@3500kbps
   ];
   //this.videoURL = 'http://ba.vod.n9uf.net//NEUF/p/a/t/VOD6470trailer_web-pathe_centurion_trailer.mp4';
   */
			console.log('playWithStaticUrl with ', this.videoURL);
			//this._samsungPlayer.Stop( );
			//this._samsungPlayer.Play( this.videoURL );

			//this.publish('canplay');
			//samsungJoshfire.oVideoElement.oElementWindow.SetSource( samsungJoshfire.oVideoElement.oElementWindow.PL_WINDOW_SOURCE_MEDIA );
			//console.log('play '+this._samsungPlayer.ResumePlay( this.videoURL, 0 ));
			//console.log('play '+this._samsungPlayer.Play( this.videoURL ));
			this.initVariables();
			this.play(this.videoURL);

			/*this.setDimension(	0, 0,
   options.width || this._samsungPlayer.GetVideoWidth(),
   options.height || this._samsungPlayer.GetVideoHeight() );
   */
			//this.setVideoStatus('playing');
			//console.log( 'samsungtv/video.mediaelement playWithStaticUrl', J.JSON.stringify( options)  );
          /*this.playData = options;
          
          if (options.html) {
          console.log('options.html', options.html);
          $("#"+this.htmlId)[0].innerHTML = options.html;
          return;
          }
          */
        },
	/**
 * @return {integer} the duration of the movie, in seconds.
 */
		getTotalTime: function() {
			console.log('samsungtv/video.mediaelement getTotalTime ' + this.iDuration);
			// no need harass
			if (this.metaDataReceived === true) {
				try {
					this.iDuration = this._samsungPlayer.GetDuration();
				} catch (e) {
					console.log('VIDEO error ' + e);
					this.iDuration = false;
				}
				if (this.iDuration === false) {
					this.errorCode = 17;
					this.error();
				}
			} else {
				this.iDuration = 0;
			}

			return this.iDuration;
        },
        /**
        * @return {integer} the number of seconds read since the beginning of the video.
        */
        getCurrentTime: function() {
			console.log('samsungtv/video.mediaelement getCurrentTime', this.currentTime);

          //if (this.player) return this.status.time;
          return this.currentTime;
        },
        /**
        * Move video reading point
        * @param {integer} seconds
        */
        setCurrentTime: function(seconds) {
			//console.log( 'samsungtv/video.mediaelement setCurrentTime for '+this.videoURL+' at '+seconds+'s');
			// limit to the video duration
			seconds = Math.max(0, seconds);
			seconds = Math.min(seconds, Math.round(this.getTotalTime() / 1000));
			// Samsung knows only how to jump, so we translate the position
			try {
				if (seconds < this.getCurrentTime()) {
					var bIsAlright = this._samsungPlayer.JumpBackward(
								Math.round(this.getCurrentTime() / 1000) - seconds
								);
				} else {
					var bIsAlright = this._samsungPlayer.JumpForward(seconds - Math.round(this.getCurrentTime() / 1000));
				}
			} catch (e) {
				console.log('VIDEO error ' + e);
				bIsAlright = false;
			}
			// this error is throwned when the user moves too fast. We just ignore it
			if (bIsAlright != true) {
				//this.errorCode = 15;
				//this.error();
			}/* else {
				// if
				this.errorCode = 0;
			}*/
        },
        /**
        * Pause video
        */
        pause: function() {
			console.log('samsungtv/video.mediaelement pause');
          if (this.videoStatus == 'paused')
            return;

          //if (this.player) this.player.pause();
			try {
				var bIsAlright = this._samsungPlayer.Pause();
			} catch (e) {
				console.log('VIDEO error ' + e);
				bIsAlright = false;
			}
			if (bIsAlright != true) {
				this.errorCode = 14;
				this.error();
			}

			this.setVideoStatus('paused');
        },
        /**
        * @function
        * @param {string|object} [sUrl] : if undefined will play the latest video URL set, if a string, will play this one.
        * @param {string} sUrl.url
        * @param {HLA|HLS} [sUrl.DRMType].
        */
	  play: function(sUrl ) {
	    console.log('VIDEO', JSON.stringify(sUrl));
	    // direct call to
	    if (typeof sUrl === 'string') {
			  sUrl = sUrl;
			// HTML5 signature : the videoUrl has already been set, the play() is called just after
		  } else if (typeof sUrl === 'undefined') {
		    sUrl = this.videoURL;
	    // a configuration object was given
	    } else {
	      var options = sUrl;
	      if (!options.url) {
	        //throw new TypeError('No URL given');
	        return this.publish('error', { message: 'samsungtv VideoMediaElement : no URL given', number: 21, origin: 'adapters/samsungtv/ui/video.mediaelement' });
	      } else {
	        sUrl = sUrl.url;
            }
	      // detect if the video has a DRM, and give it to the Samsung Player via the URL
	      if (options.DRMType) {
  			  if (options.DRMType === 'HLS'
  			    || options.DRMType === 'HLA') {
  			    sUrl += '|COMPONENT=' + options.DRMType;
			    } else {
			      return this.publish('error', { message: 'samsungtv VideoMediaElement : wrong DRM format given', number: 50, origin: 'adapters/samsungtv/ui/video.mediaelement' });
  		    }
		    }
          }

	    // still no url at this point ? fail
	    if (!sUrl) {
				this.errorCode = 21;
				return this.error();
			}

	    if (this.videoStatus != 'stopped') {
				this.stop(); // prevent player to crash if another video is already playing
			}
			this.initVariables();
			//sUrl = 'http://static.paristream.com/i2NSc74G-drm.wmv';
			//http://static.paristream.com/i2NSc74G.wmv
			this.videoURL = sUrl;
			console.log('VIDEO play ' + sUrl);
			//return;
			// Samsung player throws a 0 error code when we give him an url that is not really an url.
			// The 0 error code does not help us, so we
			try {
				//this._samsungPlayer.ClearScreen();

				//var bIsAlright = this._samsungPlayer.Play( this.videoURL );
				this._samsungPlayer.InitPlayer(this.videoURL);
				// this method does not have any effect, video is always fullscreen
				//this._samsungPlayer.SetDisplayArea(0, 0, 500, 500);

				// this method does not exist in the TV (but works on the emulator)
				//this._samsungPlayer.SetInitialBufferSize(400*1024);

				var bIsAlright = this._samsungPlayer.StartPlayback();
			} catch (e) {
				console.log('VIDEO play error ' + e);
				bIsAlright = false;
			}
			if (bIsAlright != true) {
				this.errorCode = 12;
				return this.error();
			}

			if (this.metaDataReceived === true) {
				this.setVideoStatus('playing');
			} else {
				this.setVideoStatus('loading');
			}
        },

  	/**
   * stops the video
   * @param {bool} [bForce] boolean set to true in order to bypass the security rules and force stop the video. Usefull when closing the Samsung app.
   */
        stop: function(bForce ) {
			if (bForce !== true) {
				// dont stop a video that is not playing or that is in error : it crashes
				if (this.errorCode !== 0
					|| this.videoStatus === 'stopped') {
					console.log('VIDEO stop canceled because status is ' + this.videoStatus + ' or errorCode is ' + this.errorCode);
					return false;
				}
			}
			console.log('VIDEO stop() status is ' + this.videoStatus + ' and errorCode is ' + this.errorCode);
			console.log('samsungtv/video.mediaelement stop');
			try {
				var bIsAlright = this._samsungPlayer.Stop();
			} catch (e) {
				console.log('VIDEO stop error ' + e);
				bIsAlright = false;
			}
			if (bIsAlright != true) {
				this.errorCode = 10;
				return this.error();
			}
			this.initVariables();
			this.setVideoStatus('stopped');
        },
        /**
        * Resume video
        */
        resume: function() {
			console.log('samsungtv/video.mediaelement resume');
			if (this.videoStatus !== 'paused') {
			    return console.log('VIDEO resume canceled because video is not paused');
		    }
			this.setVideoStatus('playing');
			try {
				var bIsAlright = this._samsungPlayer.Resume();
			} catch (e) {
				console.log('VIDEO resume error ' + e);
				bIsAlright = false;
			}

			if (bIsAlright != true) {
				this.errorCode = 11;
				return this.error();
			}

			//this.play();
        },
        /**
        * Remove video. For Samsung TV, use when the App is exiting
        */
        remove: function() {
          console.log('samsungtv/video.mediaelement remove');
          //called when app is closed, Samsung TV really requires it to free up memory
          // the video is the biggest resource consumer
          this.stop(true);// force the Stop() method call
          // recomended by Samsung (http://www.samsungdforum.com/Board/FAQView?BoardID=38431)
          if (this._samsungPlayer.SetScreenRect) {
            this._samsungPlayer.SetScreenRect(-1, 0, 0, 0);
          }
        },
        /**
        * @see adapters_browser_uielements_video.mediaelement.error
        */
		error: function() {
			// this._samsungPlayer.Stop();
			this.__super(ev);
			this.stop();
		},
		/*
  * the Samsung player has one unique instance, so run this method everytime you change of video
  */
		initVariables: function() {
			//this.videoStatus = null;
			this.iDuration = 0;
			this.currentTime = 0;
			this.iLastCurrentTime = 0;
			this.metaDataReceived = false;
			this.errorCode = 0;
		}
      });// end return Class


      /*
      * @event
      * @name adapters_samsungtv_uielements_videoMediaElement#error
      * @lends adapters_samsungtv_uielements_videoMediaElement.prototype
      * @return {object} an object with .message, .number and .origin
      */
      var error = function() {};
      /*
      * @event
      * @name adapters_samsungtv_uielements_videoMediaElement#loading
      */
      var loading = function() {};
      /*
      * @event
      * @name adapters_samsungtv_uielements_videoMediaElement#playing
      */
      var playing = function() {};
      /*
      * @event
      * @name adapters_samsungtv_uielements_videoMediaElement#ended
      */
      var ended = function() {};
      /*
      * @event
      * @name adapters_samsungtv_uielements_videoMediaElement#timeupdate
      * @param {object} .currentTime .totalTime properties
      */
      var timeupdate = function() {};
      /*
      * @event
      * @name adapters_samsungtv_uielements_videoMediaElement#paused
      */
      var paused = function() {};


    });// end closure and define
