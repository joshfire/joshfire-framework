/**
 * @fileoverview The DynamicContainer UI element is a wrapper around a UI
 * element whose type depends on the property values of the model to render.
 * This element is typically useful for the detail view of a list that
 * contains mixed content.
 *
 * The type of element that will be used to render the model needs to be
 * returned by an "itemFactory" function, given as creation parameter.
 * The function must take an "options" object as parameter and must return
 * the UIElement to use for rendering purpose. The "options" parameter
 * contains at least a "model" property that references the model to render.
 * Other properties may appear, taken from the container's "itemOptions"
 * initialization option.
 *
 * Usage example:
 *  var container = new DynamicContainer({
 *    itemFactory: function (options) {
 *      if (options.model['foo'] === 'bar') {
 *        // Create a special UI element when model is foo/bar
 *        return new BazElement(options);
 *      }
 *      else {
 *        // Default UI element otherwise
 *        return new UIItem(options);
 *      }
 *    });
 *  });
 *  container.setModel(youpiModel);
 *  container.render();
 *
 * The code is a mix between that of UIItem and that of List: it is a
 * UIItem in the sense that it follows changes on an underlying model
 * and a List in the sense that it encapsulates one UI element).
 */

/*global define*/

define(["joshlib!ui/item","joshlib!utils/dollar","joshlib!vendor/underscore"], function(UIItem,$,_) {

  /**
   * Definition of the DynamicContainer class.
   *
   * The class extends UIItem and automatically renders the underlying model
   * when it is updated.
   *
   * @class
   */
  var DynamicContainer = UIItem.extend({
    /**
     * Element initialization.
     *
     * Called once when the element is created.
     *
     * @function
     * @param {Object} options Element options. Should at least define
     *  a "model" property and an "itemFactory" property
     */
    initialize:function(options) {
      UIItem.prototype.initialize.call(this, options);
      
      this.itemTemplateEl = options.itemTemplateEl;
      this.itemOptions = options.itemOptions || {};
      this.itemOptions.templateEl = this.itemOptions.templateEl || this.itemTemplateEl;
      this.itemOptions.template = this.itemOptions.template || options.itemTemplate;

      this.itemFactory = function (model) {
        var params = {
          model: model
        };
        _.extend(params, this.itemOptions);
        if (options.itemFactory) {
          return options.itemFactory(params);
        }
        else {
          return new UIItem(params);
        }
      };
    },


    /**
     * Generates the HTML code to render.
     *
     * The function is called automatically when the element is rendered.
     * It calls the "generate" function of the underlying element created
     * by itemFactory for the model's values.
     *
     * @function
     * @param {function(Object,Object)} cb Callback function that receives
     *   the error if one occurred and the HTML to render otherwise
     */
    generate: function(cb) {
      var self = this;
      this.view = this.itemFactory(this.model);
      if (!this.view) {
        return cb(null, '');
      }

      // Generate the inner view from the model
      this.view.setModel(this.model);
      this.view.generate(function (err, innerHTML) {
        // The "generate" method returns the innerHTML, but we need the
        // outerHTML since that's what the inner view would generate if
        // was used on its own.
        var outerHTML = self.view.wrapContent(innerHTML);
        var html = null;
        if (outerHTML && self.template) {
          html = self.template({ child: outerHTML });
        }
        else {
          html = outerHTML ? outerHTML : '';
        }
        return cb(err, html);
      });
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
      UIItem.prototype.setContent.call(this, html);

      // Update the inner view's DOM element to point to the element that has
      // just been inserted in the DOM (and re-bind potential event handlers)
      if (this.view && this.el) {
        this.view.setElement(this.el.firstChild, true);
      }
    },


    /**
     * Enhances the resulting view in the DOM if needed.
     *
     * The function is called automatically when the element is done
     * rendering. It calls the "enhance" function of the underlying
     * element created by itemFactory for the model's values.
     *
     * @function
     */
    enhance: function() {
      var self = this;

      UIItem.prototype.enhance.call(this);
      this.view.enhance();

      // Expose inner bindings to the view that encapsulate this container
      // (TODO: the bindings are TV specific for now, should probably go
      // into a TV adapter of this container)
      var bindings = [
        'navUp', 'navRight', 'navDown', 'navLeft',
        'navAction', 'navFocus', 'navBlur'
      ];
      _.each(bindings, function (binding) {
        self[binding] = self.view[binding];
      });
    }
  });


  // Expose the element to the caller
  return DynamicContainer;
});