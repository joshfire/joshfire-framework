/**
 * @fileoverview The Layout UI element wraps multiple children views, and is
 * not directly tied to a model or collection.
 *
 * The class should be the base class of all container views.
 * The class propagates events and function calls to its children so that
 * derivated classes do not have to worry about that.
 *
 * Usage example:
 *  var layout = new Layout({
 *    children: {
 *      card1: myFirstView,
 *      card2: mySecondView
 *    }
 *  });
 *  layout.render();
 */

/*global define*/


define([
  'joshlib!uielement',
  'joshlib!vendor/underscore',
  'joshlib!utils/dollar',
  'joshlib!utils/i18n'
], function(UIElement, _, $, i18n) {
  /**
   * Definition of the Layout class.
   *
   * The class extends UIItem.
   *
   * @class
   */
  var Layout = UIElement.extend({
    /**
     * Flag set when the view is rendering
     */
    rendering: false,

    /**
     * Element initialization.
     *
     * Called once when the element is created.
     *
     * @function
     * @param {Object} options Element options. Should at least define
     *  a "children" property
     */
    initialize: function(options) {
      // Initialize template.
      if(options.template) {
        this.template = this.compileTemplate(options.template);
      } else if(options.templateEl) {
        this.template = this.compileTemplate($(options.templateEl).text());
      }

      // As explained below, we need this.customLoadEvent
      // to be always true in this case. However, we
      // do need to know
      if(options.customLoadEvent) {
        this.wantsCustomLoadEvent = true;
      }

      // Containers must wait for all of their children to be "loaded".
      // The following flag prevents the base View class from triggering
      // the "load" event at the end of the "enhance" function.
      this.customLoadEvent = true;

      this.setChildren(options.children);

      // Propagate "shown", "hidden" events to the view's children
      this.on('shown', function () {
        _.each(this.children, function (child) {
          child.trigger('shown');
        });
      }, this);
      this.on('hidden', function () {
        _.each(this.children, function (child) {
          child.trigger('hidden');
        });
      }, this);

      UIElement.prototype.initialize.call(this, options);
    },

    /**
     * Sets the children views.
     *
     * @function
     * @param {Object} an object containing the children views
     */
    setChildren: function(children) {
      if (this.children) {
        _.each(this.children, function (child) {
          this.stopListening(child);
          child.remove();
        }, this);
        this.children = null;
      }
      this.children = children;
      this.numChildren = 0;
      this.numChildrenLoaded = 0;

      if (children) {
        _.each(children, function (child) {
          ++this.numChildren;

          // Make "load" event from children "bubble".
          // Rules are:
          // - when the view is rendered, the "load" event is triggered once
          // all of its children have triggered the "load" event
          // - when the view is not rendered, the "load" event is triggered
          // whenever a child triggers a "load" event (the view cannot tell
          // whether more than one children are rendered, so it bubbles events
          // individually)
          this.listenTo(child, 'load', function () {
            if (this.rendering) {
              ++this.numChildrenLoaded;
              if (this.numChildrenLoaded === this.numChildren) {
                // All children have been loaded
                this.rendering = false;
                if(!this.wantsCustomLoadEvent) this.trigger('load');
              }
            }
            else {
              if (!this.wantsCustomLoadEvent) this.trigger('load');
            }
          });
        }, this);
      }
    },

    /**
     * Get a child view, better access than myLayout.children.myChild
     *
     * @function
     * @param {Object} the string name of the child view requested
     */
    getChild: function(child) {
      if (child) {
        return this.children[child];
      }
    },

    /**
     * Generates the HTML code to render.
     *
     * It calls the `generate` function of the underlying children.
     *
     * @function
     * @param {function(Object,Object)} cb Callback function that receives
     *   the error if one occurred and the HTML to render otherwise
     */
    generate: function(cb) {
      if(!this.children) return cb(null, '');

      this.childrenOffsets = {};
      this.numChildrenLoaded = 0;
      var accumulator = 0;
      var childrenOuterHTML = '';
      var children = {};

      _.each(this.children, function (child, name) {
        child.generate(_.bind(function (err, innerHTML) {
          var outerHTML = child.wrapContent(innerHTML, name);
          outerHTML = outerHTML.replace(/<([^\/][^ >\/]+)/, '<$1 data-joshfire-child="' + name + '"');
          this.childrenOffsets[name] = accumulator;
          children[name] = outerHTML;
          childrenOuterHTML += outerHTML;

          if(++accumulator === this.numChildren) {
            var html = null;
            if (this.template) {
              var context = {
                children: children,
                T: i18n.getText
              };
              _.extend(context, this.data);
              html = this.template(context);
            }
            else {
              html = childrenOuterHTML;
            }

            cb(null, html);
          }
        }, this));
      }, this);
    },


    /**
     * Sets the HTML content of the view to the DOM element associated with the
     * view.
     *
     * @function
     * @param {string} html The HTML content to render
     *  (it should be the inner content)
     */
    setContent: function(html) {
      UIElement.prototype.setContent.call(this, html);

      if (this.children && this.el) {
        this.setChildrenElements(true);
      }
    },

    setElement: function(element, delegate) {
      UIElement.prototype.setElement.call(this, element, delegate);
      this.setChildrenElements(delegate);
    },

    setChildrenElements: function () {
      _.each(this.children, function(child, name) {
        var el = $(this.el).find('*[data-joshfire-child='+name+']')[0];
        child.setElement(el, true);
      }, this);
    },

    /**
     * Enhances the resulting view in the DOM if needed.
     *
     * The function is called automatically when the element is done
     * rendering. It calls the "enhance" function of the underlying
     * children.
     *
     * @function
     */
    enhance: function() {
      this.rendering = true;
      UIElement.prototype.enhance.call(this);

      if (this.children && this.el) {
        _.each(this.children, function (child) {
          child.enhance();
        }, this);
      }

      if (!this.children || (this.children.length === 0) && !this.wantsCustomLoadEvent) {
        // No children to render? That means the container is loaded.
        this.rendering = false;
        this.trigger('load');
      }
    },

    /**
     * Overrides base "remove" function to propagate the request to the
     * view's children.
     *
     * Note that the view is not operational anymore after a call to "remove".
     *
     * @function
     */
    remove: function () {
      UIElement.prototype.remove.call(this);
      _.each(this.children, function (child) {
        this.stopListening(child);
        child.remove();
      }, this);
      this.children = null;
    },

    /**
     * Scrolls to top and asks its children to do the same
     */
    scrollTop: function() {
      UIElement.prototype.scrollTop.call(this);
      this.scrollTopChildren();
    },

    scrollTopChildren: function() {
      if (this.children) {
        _.each(this.children, function(child) {
          child.scrollTop();
        });
      }
    }
  });

  return Layout;
});
