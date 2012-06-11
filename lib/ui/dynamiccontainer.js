/**
 * @fileoverview The DynamicContainer UI element is a wrapper around a UI
 * element whose type depends on the property values of the model and/or the
 * collection to render.
 * This element is typically useful for rendering content when the nature of
 * the data to be displayed is not known until the collection/model is
 * fetched.
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
 *    viewFactory: function (options) {
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

define(["joshlib!uielement","joshlib!ui/item","joshlib!utils/dollar","joshlib!vendor/underscore"], function(UIElement,UIItem,$,_) {

  /**
   * Definition of the DynamicContainer class.
   *
   * The class extends UIItem and automatically renders the underlying model
   * when it is updated.
   *
   * @class
   */
  var DynamicContainer = UIElement.extend({
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
      // Initialize model.
      this.setModel(options.model);
      // Initialize collection.
      this.setCollection(options.collection);

      // Parse options.
      this.viewTemplateEl = options.viewTemplateEl || options.itemTemplateEl;
      this.viewOptions = options.viewOptions || options.itemOptions || {};
      this.viewOptions.templateEl = this.viewOptions.templateEl || this.viewTemplateEl;
      this.viewOptions.template = this.viewOptions.template || options.viewTemplate || options.itemTemplate;

      // Initialize template.
      if (options.template){
        this.template = this.compileTemplate(options.template);
      } else if (options.templateEl) {
        this.template = this.compileTemplate($(options.templateEl).html());
      }

      this.viewFactory = function (model, collection) {
        var params = {
          model: model,
          collection: collection
        };
        _.extend(params, this.viewOptions);
        factory = options.viewFactory || options.itemFactory;
        if (factory) {
          return factory(params);
        }
        else {
          return new UIItem(params);
        }
      };

      UIElement.prototype.initialize.call(this, options);
    },

    /**
     * Binds the view to the given model.
     *
     * The function ensures that the view gets rendered whenever the model
     * is changed. It does not perform an initial rendering of the view
     * unless requested.
     *
     * @function
     * @param {Model} model Backbone model to bind to the view
     * @param {Boolean} render Perform an initial rendering of the view.
     */
    setModel: function(model, render) {
      if(this.model) {
        this.model.unbind('change', this.render, this);
      }

      this.model = model;

      if(model) {
        model.bind('change', this.render, this);
      }

      if(render) this.render();
    },

    /**
     * Binds the view to the given collection.
     *
     * The function ensures that the view gets rendered whenever the collection
     * is changed. It does not perform an initial rendering of the view
     * unless requested.
     *
     * @function
     * @param {Collection} model Backbone collection to bind to the view
     * @param {Boolean} render Perform an initial rendering of the view.
     */
    setCollection: function(collection, render) {
      if(this.collection) {
        this.collection.unbind('change', this.render, this);
        this.collection.unbind('add', this.render, this);
        this.collection.unbind('remove', this.render, this);
        this.collection.unbind('reset', this.render, this);
      }

      this.collection = collection;

      if(collection) {
        collection.bind('change', this.render, this);
        collection.bind('add', this.render, this);
        collection.bind('remove', this.render, this);
        collection.bind('reset', this.render, this);
      }

      if(render) this.render();
    },

    /**
     * Generates the HTML code to render.
     *
     * The function is called automatically when the element is rendered.
     * It calls the "generate" function of the underlying element created
     * by viewFactory for the model/collection's values.
     *
     * @function
     * @param {function(Object,Object)} cb Callback function that receives
     *   the error if one occurred and the HTML to render otherwise
     */
    generate: function(cb) {
      var self = this;
      this.view = this.viewFactory(this.model, this.collection);

      if (!this.view) {
        return cb(null, '');
      }

      // Generate the inner view from the model or collection
      !this.view.model && this.view.setModel && this.view.setModel(this.model);
      !this.view.collection && this.view.setCollection && this.view.setCollection(this.collection);

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
      UIElement.prototype.setContent.call(this, html);

      // Update the inner view's DOM element to point to the element that has
      // just been inserted in the DOM (and re-bind potential event handlers)
      if (this.view && this.el) {
        this.setViewElement(true);
      }
    },

    setElement: function(element, delegate) {
      UIElement.prototype.setElement.call(this, element, delegate);
      this.setViewElement(delegate);
    },

    setViewElement: function(delegate) {
      this.view.setElement(this.el.firstChild, delegate);
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

      UIElement.prototype.enhance.call(this);
    }
  });


  // Expose the element to the caller
  return DynamicContainer;
});
