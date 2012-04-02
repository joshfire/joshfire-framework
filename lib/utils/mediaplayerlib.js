/**
 * Play media on all devices!
 *
 * Example:
 *
 *   mediaFactory.resolve(myVideoObject).toHtml(function(err, html) {
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
      if(typeof cb === 'function') cb(null, '');
    }
  });

  //--------------------------------------------------------------------------

  /**
   * Guesses the type of a url by looking at the files extension.
   *
   * @param {String} the url to inspect
   * @returns {String} the file type
   */
  var guessVideoType = function(url) {
    var ext = url.split('.').pop();

    switch(ext) {
      case 'webm': return 'video/webm'; break;
      case 'ogv': return 'video/ogg'; break;
      case 'mp4': return 'video/mp4'; break;
      default: return 'video/mp4';
    }
  };

  //--------------------------------------------------------------------------

  /**
   * A builder that produces an HTML5 video.
   *
   * @extends Builder
   */
  var Html5Builder = Builder.extend({
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
    },
    /**
     * @inherits Builder
     */
    toHtml: function(cb) {
      var html = '';
      if(this.poster) {
        html += '<video width="' + this.width + '" height="' + this.height +
                '" poster="' + this.poster + '" controls>';
      } else {
        html += '<video width="' + this.width + '" height="' + this.height +
                '" controls>';
      }

      for(var i = 0; i < this.sources.length; i++) {
        var url = this.sources[i];

        html += '<source src="' + url + '"  type="' +
                guessVideoType(url) + '" />';
      }

      html += '</video>';

      if(typeof cb === 'function') cb(null, html);
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
      var html = '';

      if(this.poster) {
        html += '<video width="' + this.width + '" height="' + this.height +
                '" poster="' + this.poster + '" controls' +
                ' class="video-js vjs-default-skin" data-setup="{}">';
      } else {
        html += '<video width="' + this.width + '" height="' + this.height +
                '" controls class="video-js vjs-default-skin"' +
                ' data-setup="{}">';
      }

      for(var i = 0; i < this.sources.length; i++) {
        var url = this.sources[i];

        html += '<source src="' + url + '"  type="' +
                guessVideoType(url) + '" />';
      }

      html += '</video>';

      // Load polyfill if needed.
      if(typeof window !== 'undefined' &&
         typeof window.VideoJS === 'undefined') {
        this.addPolyFill();
      }

      if(typeof cb === 'function') cb(null, html);
    }
  });

  //--------------------------------------------------------------------------

  /**
   * A builder that produces html using oEmbed.
   *
   * Currently supported:
   *
   *   - Flickr
   *   - Vimeo
   *   - SoundCloud
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

        urlObj = url.parse(_url);

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

        req.end()
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
        }

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
      if(cbName) {
        var url = 'http://soundcloud.com/oembed?format=js&callback='
                  + cbName + '&url=' + encodeURIComponent(options.url);
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
      if(cbName) {
        var url = 'http://vimeo.com/api/oembed.json?callback=' + cbName +
                  '&url=' + encodeURIComponent(options.url);
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
      if(cbName) {
        var url =
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
  }

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

      // This should really be specific to Youtube
      if(options.html5) {
        if(this.url.indexOf('?')) {
          //this.url += '&html5=1';
        } else {
          //this.url += '?html5=1';
        }
      }

      if(options.autoPlay) {
        if(this.url.indexOf('?')) {
          this.url += '&autoplay=1';
        } else {
          this.url += '?autoplay=1';
        }
      }
    },
    toHtml: function(cb) {
      var html = '<iframe src="' + this.url + '" width="' + this.width +
                 '" height="' + this.height + '" frameborder="0"></iframe>';

      if(typeof cb === 'function') cb(null, html);
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
          'width=' + this.width +
          '&amp;height=' + this.height;
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

      if(typeof cb === 'function') cb(null, html);
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
      Builder.call(this, options);
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
  var DefaultStrategy = Builder.extend({
    /**
     * @inherits Builder
     */
    execute: function(mediaObject, options) {
      var builder;

      if(mediaObject['@type'] === 'VideoObject') {
        if(mediaObject.playerType === 'iframe') {
          extend(options, {
            url: mediaObject.embedURL
          });

          builder = new IFrameBuilder(options);
        } else if (mediaObject.playerType === 'script') {
          extend(options, {
            url: mediaObject.embedURL,
            publisher: (mediaObject.publisher ? mediaObject.publisher.name : null)
          });

          builder = new ScriptBuilder(options);
        } else if (mediaObject.contentURL) {
          var poster = null;

          if(mediaObject.image) {
            poster = mediaObject.image.contentURL;
          }

          extend(options, {
            poster: poster,
            sources: [mediaObject.contentURL]
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
  var Html5Strategy = Builder.extend({
    /**
     * @inherits Builder
     */
    execute: function(mediaObject, options) {
      var builder;

      if(mediaObject['@type'] === 'VideoObject') {
        if(mediaObject.playerType === 'iframe') {
          extend(options, {
            url: mediaObject.embedURL,
            html5: true
          });

          builder = new IFrameBuilder(options);
        } else if (mediaObject.playerType === 'script') {
          extend(options, {
            url: mediaObject.embedURL,
            html5: true,
            publisher: (mediaObject.publisher ? mediaObject.publisher.name : null)
          });

          builder = new ScriptBuilder(options);
        } else if(!mediaObject['playerType'] && mediaObject.contentURL) {
          var poster = null;

          if(mediaObject.image) {
            poster = mediaObject.image.contentURL;
          }

          extend(options, {
            poster: poster,
            sources: [mediaObject.contentURL]
          });

          builder = new Html5Builder(options);
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
  var OEmbedStrategy = Builder.extend({
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
     * @param {String} id ID of the element where the fragment should be inserted
     */
    insertFragment: function (html, id) {
      var container = document.getElementById(id);
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
     * @param {String} id ID of the DOM element that is to contain the player
     * @param {function} cb Callback function called with potential error
     */
    insert: function (mediaObject, options, id, cb) {
      var self = this;
      var html = this.resolve(mediaObject, options).toHtml(function (err, html) {
        self.insertFragment(html, id);
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
