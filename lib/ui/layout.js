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

define(['joshlib!uielement','joshlib!vendor/underscore'], function(UIElement, _) {

  /**
   * Definition of the Layout class.
   *
   * The class extends UIItem.
   *
   * @class
   */
  var Layout = UIElement.extend({
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

      // Containers must wait for all of their children to be "loaded".
      // The following flag prevents the base View class from triggering
      // the "load" event at the end of the "enhance" function.
      this.customLoadEvent = true;

      this.setChildren(options.children);

      // Propagate "shown", "hidden" events to the view's children
      this.bind('shown', function () {
        _.each(this.children, function (child) {
          child.trigger('shown');
        });
      }, this);
      this.bind('hidden', function () {
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
      this.children = children;
      this.numChildren = 0;
      this.numChildrenLoaded = 0;

      if (children) {
        _.each(children, _.bind(function (child) {
          ++this.numChildren;

          // React to the "load" event of the child view,
          // triggering the "load" event of the container once
          // all children have been loaded.
          child.bind('load', _.bind(function () {
            ++this.numChildrenLoaded;
            if (this.numChildrenLoaded === this.numChildren) {
              // All children have been loaded
              this.trigger('load');
            }
          }, this));
        }, this));
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

      _.each(this.children, _.bind(function(child, name) {
        child.generate(_.bind(function(err, innerHTML) {
          var outerHTML = child.wrapContent(innerHTML);

          this.childrenOffsets[name] = accumulator;
          childrenOuterHTML += outerHTML;

          if(++accumulator === this.numChildren) {
            var html = null;
            if (this.template) {
              html = this.template({
                childrenOuterHTML: childrenOuterHTML
              });
            }
            else {
              html = childrenOuterHTML;
            }

            cb(null, html);
          }
        }, this));
      }, this));
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

    setChildrenElements: function(delegate) {
      _.each(this.children, _.bind(function(child, name) {
        var el = this.el.childNodes[this.childrenOffsets[name]];
        child.setElement(el, true);
      }, this));
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
      UIElement.prototype.enhance.call(this);

      if (this.children && this.el) {
        _.each(this.children, _.bind(function(child, name) {
          child.enhance();
        }, this));
      }

      if (!this.children || (this.children.length === 0)) {
        // No children to render? That means the container is loaded.
        this.trigger('load');
      }
    }
  });

  return Layout;
});
