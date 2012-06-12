/**
 * Play media on all devices!
 *
 * Example:
 *
 *   mediaFactory.resolve(myVideoObject).toHtml(function(err, html, metadata) {
 *     // Do something with the returned HTML
 *     // Beware, the returned HTML may contain <script> tags that
 *     // are necessary for the player to work correctly. Such <script>
 *     // tags won't be run when using 'innerHTML' or 'document.write'.
 *     // Use the 'insertFragment' method or a JavaScript framework such
 *     // as jQuery to handle script tags correctly.
 *     mediaFactory.insertFragment(html, 'myplayerid');
 *   });
 *
 *   mediaFactory.insert(myVideoObject, null, 'myplayerid', function (err) {
 *     // Check error
 *   });
 */
/*global document, window, require, define, Joshfire, module*/

(function(exports) {

  /**
   * Copies properties from an object to another.
   *
   * @param {Object} the object where properties get copied to
   * @param {Object} the object where properties get copied from
   * @returns {Object} the object where properties get copied to
   */
  var extend = function(to, from) {
    for(var p in from) {
      if(from.hasOwnProperty(p)) {
        to[p] = from[p];
      }
    }

    return to;
  };

  //--------------------------------------------------------------------------

  /**
   * Gets the relevant media from the given object.
   *
   * @param {Object} the media object
   * @returns {Object} the media
   */
  var getMedia = function(mediaObject) {
    if(mediaObject['@type'] === 'VideoObject' ||
       mediaObject['@type'] === 'AudioObject') {
      return mediaObject;
    } else {
      var types = ['video', 'audio', 'associatedMedia'];

      for(var i = 0, max = types.length; i < max; i++) {
        var type = types[i];

        if(typeof mediaObject[type] !== 'undefined') {
          return mediaObject[type];
        }
      }
    }
  };


  /**
   * Returns the size of the media element to generate,
   * computed from the requested width and height and
   * from the video's intrinsic ratio if defined and if
   * requested through the "adjustSize" flag.
   *
   * @param {Object} mediaObject the media object to render
   * @param {Object} options Media options
   * @returns {Object} An object with a "width" and "height"
   *  properties set to the size to use
   */
  var getMediaSize = function(mediaObject, options) {
    options = options || {};
    mediaObject = mediaObject || {};

    // Compute "requested" size, using default values
    // if size is not given.
    var requested = {
      width: options.width || 500,
      height: options.height || 281
    };
    if (mediaObject['@type'] === 'AudioObject') {
      requested.height = options.height || 40;
    }

    // Adjust the size to match the video's aspect ratio provided we know the
    // video's aspect ratio and have been told to adjust the size accordingly.
    //
    // Note size adjustment is not needed in theory, since browsers should
    // handle it automatically. A few mobile browsers fail to adjust the size
    // though.
    if (options.adjustSize) {
      // Compute aspect ratio and:
      // - the width the video should have if requested height is respected
      // - the height the video should have if requested width is respected
      // Default aspect ratio is 4/3 unless we know any better
      var ratio = 4/3;
      if (mediaObject.width && mediaObject.height) {
        ratio = mediaObject.width / mediaObject.height;
      }
      else if (mediaObject['yt:aspectRatio'] === 'widescreen') {
        ratio = 16/9;
      }
      var expected = {
        width: Math.round(requested.height * ratio),
        height: Math.round(requested.width / ratio)
      };

      // Check whether we need to adjust the final dimensions
      // (note the '1s' are meant for rounding purpose)
      if (expected.width > requested.width + 1) {
        // Screen is not large enough to render the video
        // at the requested height, let's reduce the height
        // to the maximum height that fits the requested width.
        requested.height = expected.height;
      }
      else if (expected.width < requested.width - 1) {
        // Box is too wide to render the video at that height,
        // let's reduce its width to the maximum width that fits
        // the requested height
        requested.width = expected.width;
      }
    }

    return requested;
  };


  //--------------------------------------------------------------------------

  /**
   * A builder produces HTML from a hash of options.
   * @class
   */

  /**
   * @constructor
   * @param {Object} options needed to render HTML
   */
  var Builder = function(options) {
    if(typeof this.initialize === 'function') {
      this.initialize(options);
    } else {
      Builder.prototype.initialize.call(this, options);
    }
  };

  /**
   * Creates a new class that extends Builder.
   *
   * @static
   * @param {Object} class properties
   * @returns {Function} the new class
   */
  Builder.extend = function(properties) {
    var Class = function(options) {
      Builder.call(this, options);
    };

    extend(Class.prototype, properties);
    return Class;
  };

  extend(Builder.prototype, {
    /**
     * Initilizes the builder.
     *
     * @param {Object} a hash of options
     */
    initialize: function(options) {

    },
    /**
     * Renders HTML.
     *
     * @param {Function} a callback of the form cb(err, html)
     */
    toHtml: function(cb) {
      if(typeof cb === 'function') cb(null, '', {});
    }
  });

  //--------------------------------------------------------------------------

  /**
   * Guesses the type of a url by looking at the files extension.
   *
   * @param {String} the url to inspect
   * @returns {String} the file type
   */
  var guessType = function(url) {
    if(url.match(/soundcloud/g)) return 'audio/mp3';

    var ext = url.split('.').pop();

    switch(ext) {
      case 'webm': return 'video/webm'; break;
      case 'ogv':  return 'video/ogg';  break;
      case 'mp4':  return 'video/mp4';  break;
      case 'm4v':  return 'video/mp4';  break;
      case 'ogg':  return 'audio/ogg';  break;
      case 'mp3':  return 'audio/mp3';  break;
      case 'm4a':  return 'audio/mp4';  break;
      default:     return '';
    }
  };

  //--------------------------------------------------------------------------

  /**
   * A builder that produces an HTML5 video.
   *
   * @extends Builder
   */
  var Html5VideoBuilder = Builder.extend({
    /**
     * Options:
     *
     *   - sources: an array of videos sources
     *   - [poster]: a placeholder image
     *   - width: the width of the video player
     *   - height: the height of the video player
     *
     * @inherits Builder
     */
    initialize: function(options) {
      this.sources = options.sources;
      this.poster = options.poster;
      this.width = options.width || 500;
      this.height = options.height || 281;
      this.autoPlay = options.autoPlay || false;
    },
    /**
     * @inherits Builder
     */
    toHtml: function(cb) {
      var poster = this.poster ? ' poster="' + this.poster + '"': '';
      var autoplay = this.autoPlay ? ' autoplay': '';

      var html = '<video width="' + this.width + '" height="' + this.height +
                 '" ' + poster + autoplay + ' controls ' +
                 'class="video-js vjs-default-skin" data-setup="{}">';

      for(var i = 0; i < this.sources.length; i++) {
        var url = this.sources[i];

        html += '<source src="' + url + '"  type="' +
                guessType(url) + '" />';
      }

      html += '</video>';

      if(typeof cb === 'function') cb(null, html, {
        width: this.width,
        height: this.height
      });
    }
  });

  //--------------------------------------------------------------------------

  /**
   * A builder that produces an HTML5 video with a Flash fallback.
   *
   * @extends Builder
   */
  var VideoJSBuilder = Builder.extend({
    /**
     * Options:
     *
     *   - sources: an array of videos sources
     *   - [poster]: a placeholder image
     *   - width: the width of the video player
     *   - height: the height of the video player
     *
     * @inherits Builder
     */
    initialize: function(options) {
      this.sources = options.sources;
      this.poster = options.poster || '';
      this.width = options.width || 500;
      this.height = options.height || 281;
      this.autoPlay = options.autoPlay || false;
    },
    /**
     * Loads a polyfill for HTML5 videos from <http://videojs.com/>.
     *
     * @function
     */
    addPolyFill: function() {
      var _body = document.getElementsByTagName('body')[0];
      var _link = document.createElement('link');
      var _script = document.createElement('script');

      _link.setAttribute('href', 'http://vjs.zencdn.net/c/video-js.css');
      _link.setAttribute('rel', 'stylesheet');
      _script.setAttribute('src', 'http://vjs.zencdn.net/c/video.js');

      _body.appendChild(_link);
      _body.appendChild(_script);
    },
    /**
     * @inherits Builder
     */
    toHtml: function(cb) {
      var poster = this.poster ? ' poster="' + this.poster + '"': '';
      var autoplay = this.autoPlay ? ' autoplay': '';

      var html = '<video width="' + this.width + '" height="' + this.height +
                '" ' + poster + autoplay + ' controls' +
                ' class="video-js vjs-default-skin" data-setup="{}">';

      for(var i = 0; i < this.sources.length; i++) {
        var url = this.sources[i];

        html += '<source src="' + url + '"  type="' +
                guessType(url) + '" />';
      }

      html += '</video>';

      // Load polyfill if needed.
      if(typeof window !== 'undefined' &&
         typeof window.VideoJS === 'undefined') {
        this.addPolyFill();
      }

      if(typeof cb === 'function') cb(null, html, {
        width: this.width,
        height: this.height
      });
    }
  });

  //--------------------------------------------------------------------------

  /**
   * A builder that produces an HTML5 audio tag.
   *
   * @extends Builder
   */
  var Html5AudioBuilder = Builder.extend({
    /**
     * Options:
     *
     *   - sources: an array of videos sources
     *   - [poster]: a placeholder image
     *   - width: the width of the video player
     *   - height: the height of the video player
     *
     * @inherits Builder
     */
    initialize: function(options) {
      this.sources = options.sources;
      this.width = options.width || 500;
      this.height = options.height || 40;
      this.autoPlay = options.autoPlay || false;
    },
    /**
     * @returns wether an audio tag can be used.
     */
    iCanHazAudioTag: function(url) {
      if(!document) return false;
      var audio = document.createElement('audio');
      return audio.canPlayType; // && audio.canPlayType(guessType(url));
    },
    /**
     * @inherits Builder
     */
    toHtml: function(cb) {
      var html = '';

      if(this.sources && this.sources.length) {
        for(var i = 0; i < this.sources.length; i++) {
          if(this.iCanHazAudioTag(this.sources[i])) {
            var autoplay = this.autoPlay ? ' autoplay': '';
            html = '<audio controls src="' + this.sources[i] + '"' +
                   autoplay + '></audio>';
            break;
          }
        }

        if (!html) {
          html = '<a href="' + this.sources[0] +
            '" target="_blank">Play</a>';
        }
      }

      if(typeof cb === 'function') cb(null, html, {});
    }
  });

  //--------------------------------------------------------------------------

  /**
   * A builder uses MediaElement.js for video.
   *
   * @extends Builder
   */
  var MediaElementVideoBuilder = Builder.extend({
    /**
     * Options:
     *
     *   - sources: an array of videos sources
     *   - [poster]: a placeholder image
     *   - width: the width of the video player
     *   - height: the height of the video player
     *
     * @inherits Builder
     */
    initialize: function(options) {
      this.sources = options.sources;
      this.width = options.width || 500;
      this.height = options.height || 281;
      this.autoPlay = options.autoPlay || false;
    },
    /**
     * @inherits Builder
     */
    toHtml: function(cb) {
      var id = 'mediaplayerlib-mediaelement-video-' +
               MediaElementVideoBuilder.nextId++;
      var poster = this.poster ? ' poster="' + this.poster + '"': '';
      var autoplay = this.autoPlay ? ' autoplay': '';

      var html = '<video width="' + this.width + '" height="' + this.height +
                '" ' + poster + autoplay + ' controls' +
                ' id="' + id + '">';
      for(var i = 0; i < this.sources.length; i++) {
        var url = this.sources[i];

        html += '<source src="' + url + '" />';
      }

      html += '</video>';

      html += '<script>';
      html += '$("#' + id + '").mediaelementplayer({';
      html += 'playerWidth: ' + this.width + ',';
      html += 'playerHeight: ' + this.height;
      html += '});';
      html += '</script>';

      if(typeof cb === 'function') cb(null, html, {
        width: this.width,
        height: this.height
      });
    }
  });

  MediaElementVideoBuilder.nextId = 0;

  /**
   * A builder that produces html using oEmbed.
   *
   * Currently supported:
   *
   *   - Vimeo
   *   - SoundCloud
   *   - SlideShare
   *
   * @extends Builder
   */
  var OEmbedBuilder = Builder.extend({
    /**
     * Options:
     *
     *   - width: the width of the media
     *   - height: the height of the media
     *
     * @inherits Builder
     */
    initialize: function(options) {
      this.options = options;
    },
    /**
     * @inherits Builder
     */
    toHtml: function(cb) {
      var endPoint = null;

      for(var i = 0; i < OEmbedBuilder.endPoints.length; i++) {
        if(this.options.url.match(OEmbedBuilder.endPoints[i].regexp)) {
          endPoint = OEmbedBuilder.endPoints[i];
        }
      }

      if(!endPoint) {
        if(typeof cb === 'function') cb(null, null);
        return;
      }

      if(typeof module !== 'undefined') {
        // Use node.js
        var _url = endPoint.url(null, this.options);
        var http = require('http');
        var url = require('url');

        var urlObj = url.parse(_url);

        var reqOptions = {
          host: urlObj.hostname,
          path: urlObj.pathname + urlObj.search,
          port: 80,
          method: 'GET'
        };

        var req = http.request(reqOptions, function(res) {
          var data = '';

          res.on('data', function(chunk) {
            data += chunk;
          });
          res.on('end', function() {
            if(typeof cb !== 'undefined') {
              cb(null, JSON.parse(data).html);
            }
          });
          res.on('close', function(err) {
            if(typeof cb !== 'undefined') {
              cb(err);
            }
          });
        });

        req.on('error', function(err) {
          if(typeof cb !== 'undefined') {
            cb(err);
          }
        });

        req.end();
      } else {
        // Use jsonp
        var cbName = OEmbedBuilder.cbName();
        var url = endPoint.url(cbName, this.options);
        var _body = document.getElementsByTagName('body')[0];
        var _script = document.createElement('script');

        exports[cbName] = function(data) {
          _body.removeChild(_script);
          delete exports[cbName];
          if(typeof cb === 'function') cb(null, data.html);
        };

        _script.setAttribute('src', url);
        _body.appendChild(_script);
      }
    }
  });

  /**
   * List of endpoints
   *
   * @static
   */
  OEmbedBuilder.endPoints = [{
    regexp: /soundcloud\.com/i,
    url: function(cbName, options) {
      var url = null;
      if(cbName) {
        url = 'http://soundcloud.com/oembed?format=js&callback=' +
          cbName + '&url=' + encodeURIComponent(options.url);
      } else {
        url = 'http://soundcloud.com/oembed?format=json&url=' +
              encodeURIComponent(options.url);
      }
      if(options.width) url += '&maxwidth=' + options.width;
      if(options.height) url += '&maxheight=' + options.height;
      return url;
    }
  },
  {
    regexp: /vimeo\.com/i,
    url: function(cbName, options) {
      var url = null;
      if(cbName) {
        url = 'http://vimeo.com/api/oembed.json?callback=' +
          cbName + '&url=' + encodeURIComponent(options.url);
      } else {
        url = 'http://vimeo.com/api/oembed.json?url=' +
              encodeURIComponent(options.url);
      }
      if(options.width) url += '&width=' + options.width;
      if(options.height) url += '&height=' + options.height;
      return url;
    }
  },
  {
    regexp: /slideshare\.net/i,
    url: function(cbName, options) {
      var url = null;
      if(cbName) {
        url =
          'http://www.slideshare.net/api/oembed/2?format=jsonp&callback=' + cbName +
          '&url=' + encodeURIComponent(options.url);
      } else {
        url = 'http://www.slideshare.net/api/oembed/2?url=' +
              encodeURIComponent(options.url);
      }
      if(options.width) url += '&maxwidth=' + options.width;
      if(options.height) url += '&maxheight=' + options.height;
      return url;
    }
  }];

  OEmbedBuilder.numCbName = 0;

  /**
   * Generates a callback name.
   *
   * @static
   * @returns a callback name
   */
  OEmbedBuilder.cbName = function() {
    return 'OEmbedCallBack' + (OEmbedBuilder.numCbName++);
  };

  //--------------------------------------------------------------------------

  /**
   * A builder that produces embeds a player in an iframe.
   *
   * @extends Builder
   */
  var IFrameBuilder = Builder.extend({
    /**
     * Options:
     *
     *   - url: the url of the embedded content
     *   - width: the width of the video player
     *   - height: the height of the video player
     *
     * @inherits Builder
     */
    initialize: function(options) {
      this.url = options.url;
      this.width = options.width || 500;
      this.height = options.height || 281;

      var youtube = this.url.match(/youtube/gi);
      var vimeo = this.url.match(/vimeo/gi);

      // This should really be specific to Youtube
      if(options.html5) {
        if(youtube) {
          if(this.url.indexOf('?') === -1) {
            this.url += '?html5=1';
          } else {
            this.url += '&html5=1';
          }
        }
      }

      if(options.autoPlay) {
        if(youtube || vimeo) {
          if(this.url.indexOf('?') === -1) {
            this.url += '?autoplay=1';
          } else {
            this.url += '&autoplay=1';
          }
        }
      }
    },
    toHtml: function(cb) {
      var html = '<iframe src="' + this.url + '" width="' + this.width +
                 '" height="' + this.height + '" frameborder="0"></iframe>';

      if(typeof cb === 'function') cb(null, html, {
        width: this.width,
        height: this.height
      });
    }
  });

  //--------------------------------------------------------------------------

  /**
   * A builder that produces an script tag.
   *
   * @extends Builder
   */
  var ScriptBuilder = Builder.extend({
    /**
     * Options:
     *
     *   - sources: an array of videos sources
     *   - [poster]: a placeholder image
     *   - width: the width of the video player
     *   - height: the height of the video player
     *
     * @inherits Builder
     */
    initialize: function(options) {
      this.url = options.url;
      this.publisher = options.publisher;
      this.width = options.width || 500;
      this.height = options.height || 281;
    },

    /**
     * @inherits Builder
     */
    toHtml: function(cb) {
      var url = this.url || '';
      var html = '';
      var guid = '';

      // Helper function to generate a "GUID"
      // (that's not a real GUID, but should be enough for our purpose)
      var computeGUID = function () {
        var S4 = function () {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return 'mediaplayerlib-' + S4() + S4() + S4();
      };
      guid = computeGUID();

      // Specific to Ooyala
      // -----
      // Ooyala returns a script that takes for granted that it is being run
      // while the page is loaded and that the rest of the page hasn't been
      // loaded yet. In particular, it expects the Ooyala <script> tag that
      // inserts the video to be the last one in the DOM. That's typically
      // not the case when calling mediaplayerlib as the page is likely already
      // fully loaded (and the last <script> tag can be anything).
      // The position of the player cannot be specified as a parameter. It must
      // rather be set in 'window.ooyalaActiveScript' (and it must link to a
      // <script> tag). Thus the solution is to return:
      // - a <div> with a GUID: the final video player.
      // - a script that injects a <script> tag in the above <div> and sets it
      // as the value of 'window.ooyalaActiveScript'. Note that the <script>
      // tag is not returned directly because libraries such as jQuery (that
      // may be used to inject the resulting HTML in the DOM) actually drop
      // injected <script> tags from the DOM once they have evaluated the content.
      // - the script returned by Ooyala.
      //
      // In short, the code is specific to Ooyala, leaks an element with an ID
      // and the 'window.ooyalaActiveScript' global variable (sigh!).
      //
      // IMPORTANT: only one Ooyala video may be added to the page at a time
      // since window.ooyalaActiveScript is overwritten each time. The right
      // solution would be to pass the element as a parameter to the Ooyala's
      // script but that's not under our control.
      // a time.
      if (this.publisher === 'Ooyala') {
        url += ((url.indexOf('?') === -1) ? '?' : '&amp;') +
          'width=' + encodeURIComponent(this.width) +
          '&amp;height=' + encodeURIComponent(this.height);
        html = '<div id="' + guid + '"></div>' +
          '<script type="text/javascript">' +
            'document.getElementById("' + guid + '").appendChild(document.createElement("script"));' +
            'window.ooyalaActiveScript = document.getElementById("' + guid + '").firstChild;' +
          '</script>' +
          '<script type="text/javascript" src="' + url + '"></script>';
      }
      else {
        html = '<script type="text/javascript" src="' + url + '"></script>';
      }

      if(typeof cb === 'function') cb(null, html, {
        width: this.width,
        height: this.height
      });
    }
  });

  //--------------------------------------------------------------------------

  /**
   * A builder that builds... nothing!
   *
   * @extends Builder
   */
  var VoidBuilder = Builder.extend({
    /**
     * @inherits Builder
     */
    toHtml: function(cb) {
      if(typeof cb === 'function') {
        cb(new Error('Unknown media type.'), 'Unknown media type.');
      }
    }
  });

  //--------------------------------------------------------------------------

  /**
   * A stategy that decides which builder to load.
   *
   * @class
   */
  var Strategy = function() {

  };

  extend(Strategy.prototype, {
    /**
     * Returns the best builder, or null.
     *
     * @param {Object} a media object
     * @param {Object} a hash of options
     * @returns {Builder} a builder
     */
    execute: function(mediaObject, options) {
      return new VoidBuilder(options);
    }
  });


  /**
   * Creates a new class that extends Strategy.
   *
   * @static
   * @param {Object} class properties
   * @returns {Function} the new class
   */
  Strategy.extend = function(properties) {
    var Class = function(options) {
      Strategy.call(this, options);
    };

    extend(Class.prototype, properties);
    return Class;
  };

  //--------------------------------------------------------------------------

  /**
   * The default strategy.
   *
   * @extends Strategy
   */
  var DefaultStrategy = Strategy.extend({
    /**
     * @inherits Builder
     */
    execute: function(mediaObject, options) {
      var builder;
      var media = getMedia(mediaObject) || {};
      var size = getMediaSize(media, options);
      extend(options, size);

      if(media['@type'] === 'VideoObject') {
        if(media.playerType === 'iframe') {
          extend(options, {
            url: media.embedURL
          });

          builder = new IFrameBuilder(options);
        } else if (media.playerType === 'script') {
          extend(options, {
            url: media.embedURL,
            publisher: (media.publisher ? media.publisher.name : null)
          });

          builder = new ScriptBuilder(options);
        } else if (media.contentURL) {
          var poster = null;

          if(media.image && media.image.contentURL) {
            poster = media.image.contentURL;
          }

          extend(options, {
            poster: poster,
            sources: [media.contentURL]
          });

          builder = new VideoJSBuilder(options);
        }
      }

      return builder || new VoidBuilder();
    }
  });

  //--------------------------------------------------------------------------

  /**
   * A stragegy for HTML5 friendly browsers.
   *
   * @extends Strategy
   */
  var Html5Strategy = Strategy.extend({
    /**
     * @inherits Builder
     */
    execute: function(mediaObject, options) {
      var builder;
      var media = getMedia(mediaObject) || {};
      var size = getMediaSize(media, options);
      extend(options, size);

      if(media.playerType === 'iframe') {
        extend(options, {
          url: media.embedURL,
          html5: true
        });

        builder = new IFrameBuilder(options);
      } else if (media.playerType === 'script') {
        extend(options, {
          url: media.embedURL,
          html5: true,
          publisher: (media.publisher ? media.publisher.name : null)
        });

        builder = new ScriptBuilder(options);
      } else if(media['@type'] === 'VideoObject') {
        if(media.contentURL) {
          var poster = null;

          if(media.image) {
            poster = media.image.contentURL;
          }

          extend(options, {
            poster: poster,
            sources: [media.contentURL]
          });

          builder = new Html5VideoBuilder(options);
        }
      } else if(media['@type'] === 'AudioObject') {
        if(media.contentURL) {
          extend(options, {
            sources: [media.contentURL]
          });

          builder = new Html5AudioBuilder(options);
        }
      }

      return builder;
    }
  });

  //--------------------------------------------------------------------------

  /**
   * A stragegy for MediaElement.js.
   *
   * Note: the MediaElement.js lib is not included! The developer has to
   * include it his/her application?
   *
   * @extends Strategy
   */
  var MediaElementStrategy = Strategy.extend({
    /**
     * @inherits Builder
     */
    execute: function(mediaObject, options) {
      var media = getMedia(mediaObject) || {};
      var size = getMediaSize(media, options);
      extend(options, size);

      var builder;

      if(mediaObject['@type'] === 'VideoObject') {
        if(typeof mediaObject.contentURL !== 'undefined') {
          var poster = null;

          if(media.image) {
            poster = media.image.contentURL;
          }

          extend(options, {
            poster: poster,
            sources: [mediaObject.contentURL]
          });

          builder = new MediaElementVideoBuilder(options);
        }
      } else if(mediaObject['@type'] === 'AudioObject') {
        if(typeof mediaObject.contentURL !== 'undefined') {
          extend(options, {
            sources: [mediaObject.contentURL]
          });
        }
      }

      return builder;
    }
  });

  //--------------------------------------------------------------------------

  /**
   * A stragegy for oEmbed.
   *
   * @extends Strategy
   */
  var OEmbedStrategy = Strategy.extend({
    /**
     * @inherits Builder
     */
    execute: function(mediaObject, options) {
      var builder;

      if(typeof mediaObject.url !== 'undefined') {
        extend(options, {
          url: mediaObject.url
        });

        builder = new OEmbedBuilder(options);
      }

      return builder;
    }
  });

  //--------------------------------------------------------------------------

  /**
   * A factory that returns media builders from a media object.
   *
   * @class
   */
  var MediaFactory = function() {
    this.strategies = {
      def: new DefaultStrategy(),
      html5: new Html5Strategy(),
      mediaElement: new MediaElementStrategy(),
      oembed: new OEmbedStrategy()
    };
  };

  // TODO: add strategies

  extend(MediaFactory.prototype, {
    /**
     * Returns a media builder from a media object and a hash of options.
     *
     * @param {Object} a media object
     * @param {Object} a hash of options
     * @returns {Builder} a builder
     */
    resolve: function(mediaObject, options) {
      options = options || {};

      var builder;

      if(typeof options.strategy !== 'undefined' &&
         typeof this.strategies[options.strategy] !== 'undefined') {
        var strategy = this.strategies[options.strategy];
        builder = strategy.execute(mediaObject, options);
      }

      return builder || this.strategies.def.execute(mediaObject, options);
    },


    /**
     * Inserts the video player returned by resolve.toHtml in the DOM.
     *
     * The function takes care of running scripts when necessary. It is
     * a simple version of the jQuery's "append" method and a more complete
     * version of Zepto's similar method (Zepto only handles inline scripts
     * but not tags that target an external script).
     *
     * TODO: clean the 'script' tag inserted once script is done loading
     *
     * @function
     * @param {String} html The HTML fragment to insert in the DOM
     * @param {String|Element} el ID of the DOM element that is to contain
     *  the player or element itself
     */
    insertFragment: function (html, el) {
      var container = null;
      if (Object.prototype.toString.call(el) === '[object String]') {
        container = document.getElementById(el);
      }
      else {
        container = el;
      }
      container.innerHTML = ('' + html).trim();

      function traverseNode (node, fun) {
        fun(node);
        for (var key in node.childNodes) {
          traverseNode(node.childNodes[key], fun);
        }
      }
      function nodeName(elem, name) {
        return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
      }
      function evalScript(elem) {
        var data = ( elem.text || elem.textContent || elem.innerHTML || "" );
        var src = elem.getAttribute('src');

        var head = document.getElementsByTagName("head")[0] ||
          document.documentElement;
        var script = document.createElement("script");
        script.type = "text/javascript";
        if (src) script.setAttribute('src', src);
        if (data) script.appendChild(document.createTextNode(data));
        head.insertBefore(script, head.firstChild);
        if (elem.parentNode) {
          // Remove the script from its initial position
          elem.parentNode.removeChild(elem);
        }
      }

      var scripts = [];
      var script = null;

      traverseNode(container, function (node) {
        if (node.nodeName &&
          (node.nodeName.toUpperCase() === 'SCRIPT') &&
          (!node.type || node.type === 'text/javascript')) {
          scripts.push(node);
        }
      });

      for (script in scripts) {
        evalScript(scripts[script]);
      }
    },


    /**
     * Inserts a video player for the given media object in the DOM tree.
     *
     * @function
     * @param {Object} mediaObject a MediaObject schema.org object
     * @param {Object} options a hash of options
     * @param {String|Element} el ID of the DOM element that is to contain
     *  the player or element itself
     * @param {function} cb Callback function called with potential error
     */
    insert: function (mediaObject, options, el, cb) {
      var self = this;
      var html = this.resolve(mediaObject, options).toHtml(function (err, html) {
        self.insertFragment(html, el);
        if(typeof cb === 'function') cb(null);
      });
    }
  });

  //--------------------------------------------------------------------------

  if(typeof Joshfire !== 'undefined' &&
     typeof Joshfire.define !== 'undefined') {
    Joshfire.define([], function() { return new MediaFactory(); });
  } else if(typeof define !== 'undefined') {
    define([], function() { return new MediaFactory(); });
  } else {
    exports.mediaFactory = new MediaFactory();
  }

})(typeof module !== 'undefined' ? module.exports : window);
