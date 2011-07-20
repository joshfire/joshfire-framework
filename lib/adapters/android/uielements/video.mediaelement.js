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

Joshfire.define(['joshfire/uielements/video', 'joshfire/class', 'joshfire/vendor/underscore', 'joshfire/main'],
    function(Video, Class, _, J) {

      return Class(Video, {
        init: function() {
          // other UI elements need to have this element that exist
          var oEl = document.createElement('div');
          oEl.id = this.htmlId;

          //console.log('VIDEO INIT '+ this.htmlId);
          J.onReady(function() {
            document.body.appendChild(oEl);
          });

        },
        playWithStaticUrl: function(options) {
      	console.log('Android VideoMediaElement.playWithStaticUrl');
      	this.playData = options;
      	//console.log('VideoMediaElement.playWithStaticUrl', this.playData);
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
      	if (options.protocol && options.protocol.toUpperCase() != 'HTTP') {
      	    if (options.protocol === 'RTSP') {
      	        this.videoURL = this.videoURL.replace(/^http:\/\//, 'rtsp://');
      	    } else {
      	        throw new TypeError('wrong DRM format given');
            }
      	}

      	/*var oFakeAID = 'qsmdlkfj';
       oFakeA = document.getElementById( oFakeAID );
       if(!oFakeA) {
       var oFakeA = document.createElement('A');
       document.body.appendChild( oFakeA );
       }
       //    oFakeAID
       oFakeA.href = this.videoURL;
       oFakeA.click();
       console.log('click?');
       */
      	// rtsp://real.ucar.edu/mms/eol/nsfuw/guy-brasseur.mp4 <= that rtsp mp4 video works fine on android
      	// catched by the Java shouldOverrideUrlLoading method
      	document.location = this.videoURL;
      	//return console.log('tried to play '+options.url+' but video player is not implemented on Android');
        }
      });

    });
