/**
 * @fileoverview Base View class for the Joshfire Framework.
 *
 * The base view derivates from Backbone's view, adding a three-step
 * asynchronous-friendly rendering logic on top of Backbone's "render" logic.
 *
 * The rendering steps are:
 *
 * 1. generate: Computes the HTML content to render as a string. This step
 * may be asynchronous, meaning it can be deported server-side or in a worker
 * as needed. The generate method either returns the inner HTML content to
 * put in the wrapping element associated with the view, or the outer HTML
 * content (wrapping element included), depending on the value of its first
 * parameter.
 *
 * 2. setContent: Sets the HTML content prepared by generate as inner HTML
 * of the wrapping element.
 *
 * 3. enhance: Completes the code with additional logic (e.g. event handlers)
 *
 * Unless absolutely needed, the "render" function should never have to be
 * overridden in derivated classes. Note that function sets the "rendered"
 * flag at the end of the rendering process.
 *
 * All views used in the framework must derive from this base class and must
 * respect those three steps (in particular, the HTML content must be prepared
 * as a string before it is applied to the underlying DOM element).
 *
 * Actually, all views used in the framework should rather derive from the
 * UIElement class (that class is a synonymous to View in the generic case but
 * is overridden in device-specific and capability-specific adapters)
 *
 * IMPORTANT: unless you have a good reason not to, you should always call
 * the "initialize" function of the parent's class from within the "initialize"
 * function of a derived class, using something such as:
 *  initialize: function (options) {
 *   View.prototype.initialize.call(this, options);
 *  }
 * ... replacing "View" with the appropriate parent's class name in your code.
 */

/*global define*/

define([
  'joshlib!utils/dollar',
  'joshlib!utils/woodman',
  'joshlib!vendor/backbone',
  'joshlib!vendor/underscore'
], function ($, woodman, Backbone, _) {
  var logger = woodman.getLogger('joshfire.framework.view');

  /**
   * Base View class.
   *
   * All views in the framework extend this base class.
   *
   * The base view itself is an extension to Backbone views that introduces:
   * - a three-step asynchronous rendering logic on top of Backbone's "render"
   * logic, with "generate", "setContent" and "enhance"
   * - a "rendered" flag set when the view has already been rendered. This flag
   * may be used to detect cases when updating the view is not needed since it
   * has simply not yet been rendered.
   * - show/hide functions
   * - an images loader mechanism that renders a loading spinner while images
   * get loaded in the background. The "imageLoad" event is triggered whenever
   * a new image has been loaded. The "imagesLoad" event is triggered when all
   * images have been loaded.
   * - a "load" event triggered when the view is rendered and fully loaded,
   * unless the "customLoadEvent" option was set when the view was created.
   */
  var newView = Backbone.View.extend({

    /**
     * Shortcut to underscore's templating function
     */
    compileTemplate: _.template,


    /**
     * The rendered flag is set when the view is rendered for the first time.
     *
     * The flag is maintained internally but not used. Derived classes may use
     * that flag to detect whether the view needs to be updated or rendered.
     *
     * The only way to reset the flag once set is to call the "remove" function
     * which also removes all events that the view listened to and, in derived
     * classes, possible models and collections that were bound to the view.
     *
     * The rendered flag and the removed flag are mutually exclusive.
     *
     * @type {boolean}
     */
    rendered: false,


    /**
     * The removed flag is set when the view is removed from the DOM through a
     * call to the "remove" function.
     *
     * The flag is maintained internally. It is mostly intended as a gatekeeper
     * to ensure that nothing runs once the view has been removed. It is used
     * by the "callIfNotRemoved" function.
     *
     * Once removed, the only way to put a view back into the DOM is to render
     * the view again.
     *
     * The rendered flag and the removed flag are mutually exclusive.
     *
     * @type {boolean}
     */
    removed: false,


    /**
     * The hidden flag is set when the view is hidden from the DOM tree.
     *
     * Note the flag may be set when the view has not yet been rendered,
     * typically when the view is created. When that happens, the root element
     * of the view receives a "display: none" style attribute when the view is
     * rendered.
     *
     * @type {boolean}
     */
    hidden: false,


    /**
     * Initializes the log ID used to trace the events of the view.
     *
     * The function sets "this.logid" to a unique ID that identifies the view.
     * That value is computed from the provided parameters, falling back to
     * Backbone's "this.cid" when no better ID could be found.
     *
     * The function should be called at the beginning of the initialize
     * method, typically before the first call to "logger.log".
     *
     * The function can be called multiple times. It will only set the
     * log ID the first time it is called.
     *
     * @function
     * @param {Object} options The options object passed to "initialize"
     */
    initializeLogId: function (options) {
      if (this.logid) return;
      options = options || {};
      this.logid = options.logid ||
        this.cid + (options.name ? '-' + options.name : '');
    },


    /**
     * Initialization code that gets executed when the view is created
     *
     * @function
     * @param {Object} options View options
     *  (options.data is kept in the view's data property)
     */
    initialize: function (options) {
      options = options || {};

      // Initialize the instance ID for logging purpose as needed
      this.initializeLogId(options);
      logger.log(this.logid, 'initialize');

      // Should the view be rendered hidden?
      this.hidden = !!options.hidden;

      this.data = options.data || {};
      this.loadImagesSmoothly = options.loadImagesSmoothly || false;
      this.imageClass = options.imageClass;
      this.processImageEl = options.processImageEl;

      // Set the image extractor if defined, or use default one
      this.getImages = options.getImages || _.bind(function () {
        // BEWARE: $.map('img', blah) is different from $('img').map(blah)
        // in Zepto 1.0rc1 (the order of parameters is not the same).
        // Use $.map for a consistent behavior between Zepto and jQuery
        var images = $.map(this.$('img'), function (el) {
          if (this.imageClass) {
            $(el).addClass(this.imageClass);
          }
          return {
            el: el,
            url: $(el).attr('src')
          };
        });
        return images;
      }, this);

      this.customLoadEvent = options.customLoadEvent || false;
      this.loadingClass = options.loadingClass || null;
      if (this.loadingClass) {
        if (!_.isString(this.loadingClass)) {
          this.loadingClass = 'loading';
        }
      }
      this.onScroll = options.onScroll || null;
    },

    /**
     * Renders the view.
     *
     * This function should never need to be overwritten in derivated classes:
     * it implements the three-step generate / setContent / enhance logic.
     *
     * Rendering may be asynchronous, so there is no guarantee that rendering
     * is done when this function returns (although most views are rendered
     * synchronously in practice).
     *
     * @function
     * @return {newView} A reference to the current object for chaining purpose
     */
    render: function () {
      logger.log(this.logid, 'render');
      this.generate(_.bind(function (err, html) {
        // TODO: react on error!
        if (html !== false) {
          this.setContent(html);
        }
        this.enhance();
      }, this));
    },

    /**
     * Sets the HTML content of the view to the DOM element associated with the
     * view.
     *
     * The HTML content of the view is typically that returned by generate.
     *
     * Note the HTML content is set with "$.append" to ensure <script> tags are
     * correctly handled.
     *
     * IMPORTANT: Container views should override that function to update the
     * root element of the view(s) they contain. They should still call this
     * base function (if not, remember to set the "rendered" flag and to take
     * the "hidden" flag into account).
     *
     * @function
     * @param {string} html The HTML content to render
     *  (it should be the inner content)
     */
    setContent: function (html) {
      // Ensure the view is hidden if so requested, or shown otherwise.
      // Note we don't call the view's "hide" and "show" methods not to trigger
      // events that are only triggered when the view's "hidden" state changes.
      if (this.hidden) {
        this.$el.hide();
      }
      else {
        this.$el.show();
      }
      this.$el.html('');
      this.$el.append(html);
      this.removed = false;
      this.rendered = true;
    },

    /**
     * Generates the view's HTML content for the underlying model.
     *
     * The HTML content generated is the inner HTML of the view, i.e. it
     * does not include the wrapping element of the view (this.el).
     *
     * Default implementation returns an empty string. Override this function
     * in derivated classes to return meaningful HTML content.
     *
     * Generation may be asynchronous. The callback function receives the
     * error or the generated HTML content.
     *
     * @function
     * @param {function} cb Callback function
     */
    generate: function (cb) {
      logger.warn(this.logid, 'generate',
        'abstract method called, concrete method missing from current class?');
      cb(null, '');
    },


    /**
     * Returns the HTML content wrapped in the view's DOM element.
     *
     * The function returns the HTML content that would be returned by
     * a serialization of the DOM element associated DOM element
     * after a call to render.
     *
     * This function is useful for container views: such views should call
     * the wrapContent function of their children with the HTML content
     * returned by their generate function to compute the appropriate outerHTML
     * content for the child view without having to convert the HTML to
     * a DOM element and back to an HTML string.
     *
     *
     * Notes:
     * - the function does not alter the underlying DOM element in any way
     * since it could be rendered with other data when the function is called.
     * - the function would perhaps better be integrated as a flag parameter
     * of the generate function that container views must set when calling
     * their children's generate method. All views that override "generate"
     * would need to be updated, and that would not bring much difference
     * in the end (container views would need to remember to set the flag as
     * they need to remember to call wrapContent with this implementation),
     * so leaving it as is for now to reduce the amount of changes made to
     * the framework.
     *
     * @function
     * @param {string} innerHTML Inner HTML that is to be rendered.
     * @return {string} Wrapped content.
     */
    wrapContent: function (innerHTML, childName) {
      logger.log(this.logid, 'wrapContent', 'childName=' + childName);
      innerHTML = innerHTML || '';

      // Helper function that escapes a string for inclusion in an HTML snippet
      var escapeHtml = function (str) {
        if (!str) return '';
        return str.replace(/&/g,'&amp;')
          .replace(/>/g,'&gt;')
          .replace(/</g,'&lt;')
          .replace(/"/g,'&quot;');
      };
      // Note Backbone normally guarantees that this.el is set, so the
      // following check should be useless in practice.
      if (!this.el) return '<div>' + innerHTML + '</div>';

      // Generate the wrapped content, using the DOM element's name and
      // attributes values.
      var outerHTML = '<' + this.el.nodeName.toLowerCase();

      // Important note:
      //
      // On Samsung SmartTV 2011 (Maple browser), you cannot use _.each or a
      // 'for in' loop to iterate DOM attributes. You must use a regular loop.

      /*_.each(this.el.attributes, function (attr) {
        // TODO: escape attributes values properly
        if (attr.value) {
          outerHTML += ' ' + attr.name + '="' + escapeHtml(attr.value) + '"';
        }
        else {
          outerHTML += ' ' + attr.name;
        }
      });*/
      for(var i = 0; i < this.el.attributes.length; i++) {
        var attr = this.el.attributes[i];

        if (attr.value) {
          outerHTML += ' ' + attr.name + '="' + escapeHtml(attr.value) + '"';
        }
        else {
          outerHTML += ' ' + attr.name;
        }
      }

      if (this.hidden) {
        outerHTML += ' style="display:none"';
      }

      if (childName) {
        outerHTML += ' data-joshfire-child="'+escapeHtml(childName)+'"';
      }

      outerHTML += '>' + innerHTML +
        '</' + this.el.nodeName.toLowerCase() + '>';
      return outerHTML;
    },

    /**
     * Hides the view's DOM element
     *
     * @function
     */
    hide: function() {
      if (this.hidden) {
        logger.log(this.logid, 'hide', 'already hidden');
        return;
      }
      logger.log(this.logid, 'hide');
      this.$el.hide();
      this.hidden = true;
      this.trigger('hidden');
      this.trigger('hide');
    },

    /**
     * Shows the view's DOM element
     *
     * @function
     */
    show: function() {
      if (!this.hidden) {
        logger.log(this.logid, 'show', 'already shown');
        return;
      }
      logger.log(this.logid, 'show');
      this.$el.show();
      this.hidden = false;
      this.trigger('shown');
      this.trigger('show');
    },


    /**
     * Loads all the images extracted from the DOM in the background and flags
     * the image containers with a "loading" class name.
     *
     * The function runs asynchronously. It triggers an "imageload" event each
     * time a new image gets loaded and an "imagesload" event when all images
     * have been loaded.
     *
     * @function
     */
    runImageLoader: function () {
      if (!this.getImages) {
        this.trigger('load');
        return;
      }

      // Extract the images to load
      var images = this.getImages();
      if (!images || (images.length === 0)) {
        // No image to load, we're done
        logger.log(this.logid, 'images loader', 'no image to load');
        this.trigger('imagesLoad');
        if (!this.customLoadEvent) this.trigger('load');
        return;
      }

      // Load the images in the background and trigger the 'load'
      // event in the background.
      logger.log(this.logid, 'images loader', 'images=' + images.length);
      var imagesLoaded = 0;
      var imageLoaded = _.bind(function (err, imageEl) {
        if (imageEl) $(imageEl).removeClass('loading');
        this.trigger('imageLoad', err, imageEl);
        imagesLoaded += 1;
        if (imagesLoaded === images.length) {
          // All images have been loaded
          logger.log(this.logid, 'images loader', 'done');
          this.trigger('imagesLoad');
          if (!this.customLoadEvent) this.trigger('load');
        }
      }, this);
      _.each(images, _.bind(function (image) {
        if (!image.el || !image.url) {
          return imageLoaded(image.el);
        }
        var imageEl = image.el;
        if (this.processImageEl) {
          imageEl = this.processImageEl(image.el);
        }
        $(imageEl).addClass('loading');
        var imageObject = new Image();
        imageObject.onload = function () {
          imageLoaded(null, imageEl);
          imageObject = null;
        };
        imageObject.onerror = function () {
          var err = 'Error';//TODO new BaseError();
          imageLoaded(err, imageEl);
          imageObject = null;
        };
        imageObject.src = image.url;
      }, this));
    },

    /**
     * Enhances the view with additional logic.
     *
     * Default implementation does not do anything other than triggering
     * the "load" event unless the view asserts that it will handle the
     * event itself.
     *
     * Override this function in derivated classes as needed.
     * Set the "customLoadEvent" view flag to handle the "load" event in
     * derivated classes (e.g. an image loader would typically trigger the
     * event when it's done loading the image).
     *
     * @function
     */
    enhance: function() {
      logger.log(this.logid, 'enhance');

      // If view is not done loading, add a "loading" class to the view's
      // element if needed and remove it when loading is over.
      if (this.isLoadingNeeded() && this.$el) {
        this.showLoader();
        this.off('load', this.hideLoader, this);
        this.on('load', this.hideLoader, this);
      }

      if (this.isImageLoadingNeeded() && this.$el) {
        this.runImageLoader();
      }

      if (this.onScroll) {
        this.$el.off('scroll', this.onScrollHandler);
        this.$el.on('scroll', this.onScrollHandler);
      }

      if (!this.customLoadEvent && !this.isImageLoadingNeeded()) {
        logger.log(this.logid, 'enhance', 'view loaded');
        this.trigger('load');
      }
    },

    /**
     * Change the view's element ("this.el" property), including event
     * re-delegation.
     *
     * The function sets the "rendered" flag when the view's element is changed
     * (as opposed to set) to indicate that the view has just been associated
     * with a DOM subtree and is thus "likely" to have been rendered. There is
     * unfortunately no better way for the time being to tell whether the view
     * has been rendered or not. It should work well if framework views are
     * used "normally".
     *
     * TODO: use a "data-joshfire-rendered" attribute on the view's element to
     * be able to tell whether the view has been really rendered or not?
     *
     * @function
     * @param {Element} element The DOM element to use as root for the view
     * @param {boolean} delegate True to delegate events to the new element
     */
    setElement: function (element, delegate) {
      var changed = !!this.el;
      Backbone.View.prototype.setElement.call(this, element, delegate);
      if (changed) {
        this.removed = false;
        this.rendered = true;
      }
      return this;
    },

    /**
     * Overrides default "remove" function for logging purpose
     *
     * @function
     */
    remove: function () {
      this.removed = true;
      this.rendered = false;
      logger.log(this.logid, 'remove');
      Backbone.View.prototype.remove.call(this);
    },

    /**
     * Returns a callback function that only gets called provided
     * the view has not yet been removed.
     *
     * That function is useful to wrap event handlers of a view as an event
     * handler may still be called "shortly after" the view has been removed,
     * typically when the call to "remove" was made by a previous event handler
     * in the list of event handlers attached to an event.
     *
     * @function
     * @param {function} callback Callback function
     */
    callIfNotRemoved: function (callback) {
      var self = this;

      return function () {
        if (self.removed) return;
        var args = Array.prototype.slice.call(arguments);
        callback.apply(self, args);
      };
    },

    onScrollHandler: _.bind(function(e) {
      var el = $(e.target);
      this.onScroll.call(el[0], e, el[0].scrollHeight, el.scrollTop(), el.scrollLeft());
    }, this),

    /**
    * The scrollTo function tries its best to scroll where you want.
    */
    scrollTop: function() {
      this.$el.animate({
        scrollTop: 0,
        scrollLeft: 0
      }, 500);
    },

    isLoadingNeeded: function() {
      return (this.loadingClass);
    },

    isImageLoadingNeeded: function() {
      return (this.loadImagesSmoothly);
    },

    showLoader: function() {
      this.$el.addClass(this.loadingClass);
    },
    hideLoader: function() {
      this.$el.removeClass(this.loadingClass);
    }
  });

  return newView;

});