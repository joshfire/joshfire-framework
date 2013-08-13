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
 *
 * The dynamic container class uses an "update" mechanism to detect whether
 * it needs to render itself again when the underlying model or collection
 * changes. By default, given a collection, that mechanism re-renders the view
 * when the view moves between one of the following cases:
 * - no known model associated with the container
 * - exactly 1 known model associated with the container
 * - more than one models associated with the container
 *
 * If the dynamic container is not associated with a collection, the update
 * mechanism re-renders the view whenever the associated model changes.
 *
 * The default update mechanism may be overridden provided a "needsUpdate"
 * function that takes a model and a collection as parameters gets passed as
 * option when the view is created. That function must return "true" to force
 * a re-render of the view.
 *
 * TODO: the class should derive from Layout or from a potential Wrapper
 * base class that provides common functionalities to all wrapper views.
 */

/*global define*/

define([
  'joshlib!uielement',
  'joshlib!ui/item',
  'joshlib!utils/dollar',
  'joshlib!utils/woodman',
  'joshlib!vendor/underscore'
], function (UIElement, UIItem, $, woodman, _) {
  var logger = woodman.getLogger('joshfire.framework.ui.dynamiccontainer');

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
    initialize: function (options) {
      options = options || {};

      this.initializeLogId(options);
      logger.log(this.logid, 'initialize');

      // No model rendered to start with
      this.modelsRendered = 0;

      // Initialize model.
      this.setModel(options.model);

      // Initialize collection.
      this.setCollection(options.collection);

      // Parse options.
      this.viewTemplateEl = options.viewTemplateEl || options.itemTemplateEl;
      this.viewOptions = options.viewOptions || options.itemOptions || {};
      this.viewOptions.templateEl = this.viewOptions.templateEl || this.viewTemplateEl;
      this.viewOptions.template = this.viewOptions.template || options.viewTemplate || options.itemTemplate;

      // Initialize the HTML template of the view
      if (options.templateEl) {
        this.template = this.compileTemplate($(options.templateEl).text());
      }
      else if (options.template) {
        if (_.isFunction(options.template)) {
          this.template = options.template;
        }
        else {
          this.template = this.compileTemplate(options.template);
        }
      }

      this.viewFactory = _.bind(function () {
        logger.log(this.logid, 'view factory',
          'model=' + !!this.model,
          'collection=' + !!this.collection);
        var params = {
          model: this.model,
          collection: this.collection
        };
        _.extend(params, this.viewOptions);
        var factory = options.viewFactory || options.itemFactory;
        if (factory) {
          return factory(params);
        }
        else {
          return new UIItem(params);
        }
      }, this);

      // Function that returns "true" when the encapsulated view needs to be
      // updated. This function gets called by "update" whenever a change gets
      // detected on the model/collection associated with the view.
      // The caller should provide a "needsUpdate" function that receives the
      // model and collection as parameters to implement its own update logic.
      this.needsUpdate = _.bind(function () {
        var nbModels = 0;
        var updateNeeded = false;

        if (options.needsUpdate) {
          // The caller provided a "needsUpdate" function,
          // delegate the decision to that function.
          updateNeeded = options.needsUpdate(this.model, this.collection);
          logger.log(this.logid, 'needs update',
            'delegated res=', !!updateNeeded);
        }
        else if (!this.collection) {
          // Only one model associated with the view (or nothing), consider
          // that any change is a valid cause to change the encapsulated view.
          logger.log(this.logid, 'needs update', 'true as no collection');
          updateNeeded = true;
        }
        else {
          // Detect changes between the different cases:
          // - no model rendered and >=1 models now associated with the view
          // - 1 model rendered and <>1 model now associated with the view
          // - >1 models rendered and <=1 model now associated with the view
          nbModels = this.getNumberOfModels();
          updateNeeded = ((this.modelsRendered === 0) && (nbModels !== 0)) ||
            ((this.modelsRendered === 1) && (nbModels !== 1)) ||
            ((this.modelsRendered > 1) && (nbModels <= 1));
          logger.log(this.logid, 'needs update', !!updateNeeded,
            'rendered=' + this.modelsRendered,
            'new=' + nbModels);
        }
        return updateNeeded;
      }, this);

      // We'll trigger the "load" event when the underlying view is loaded
      this.customLoadEvent = true;

      // Propagate "shown", "hidden" events to the view's children
      this.listenTo(this, 'shown', function () {
        if (this.view) this.view.trigger('shown');
      });
      this.listenTo(this, 'hidden', function () {
        if (this.view) this.view.trigger('hidden');
      });

      UIElement.prototype.initialize.call(this, options);
    },


    /**
     * Returns the number of models associated with the view, summing up
     * the model set by a call to "setModel" and the models of the collection
     * set by a call to "setCollection" as needed.
     *
     * This number is typically useful for "simple" update rules where the
     * view encapsulated by the dynamic container needs to be changed based
     * on the number of models associated with the view.
     *
     * @function
     * @return {integer} The number of models associated with the view
     */
    getNumberOfModels: function () {
      return (this.model ? 1 : 0) +
        (this.collection ? this.collection.length : 0);
    },


    /**
     * Binds the view to the given model.
     *
     * Once bound to a model, the view will be automatically updated whenever
     * the model changes. By default, the update takes the form of a
     * re-rendering of the view but derived classes may override the "update"
     * function to implement less DOM intensive update mechanisms.
     *
     * This function only sets the given model. In particular, if the view is
     * already rendered, this function does not trigger an update. Set the
     * second parameter to force the update.
     *
     * TODO: Consider changing the default behavior. if the view is already
     * rendered and the view receives a new model, it should be automatically
     * updated. Note that update would likely affect running code that uses the
     * framework, so beware.
     *
     * @function
     * @param {Model} model Backbone model to bind to the view
     * @param {Boolean} update Update the view when set. When not, the view
     *  will just wait for new events on the model to update itself.
     */
    setModel: function (model, update) {
      if (this.model) {
        this.stopListening(this.model);
      }

      this.model = model;
      this.modelsUpdated = true;

      if (model) {
        logger.log(this.logid, 'set model', 'update=' + !!update);
        this.listenTo(model, 'change', this.callIfNotRemoved(this.update));
      }

      if (update) {
        this.update();
      }
    },


    /**
     * Sets the collection associated with the view
     *
     * Once bound to a collection, the view will be automatically updated
     * whenever the collection changes. By default, the update takes the form
     * of a re-rendering of the view but derived classes may override the
     * "update" function to implement less DOM intensive update mechanisms.
     *
     * This function only sets the given collection. In particular, if the view
     * is already rendered, this function does not trigger an update. Set the
     * second parameter to force the update.
     *
     * Note that the function only listens to events triggered once the updates
     * made to the collection are over. In particular, the "sync" event is
     * triggered when all the items have been retrieved from the server whereas
     * the "add" event is triggered for each new item in the collection and is
     * typically followed by one or more other "add" events and a "sync" event.
     * Listening to final events is important as the child views created when
     * an update is needed will likely also depend on the collection and need
     * to be initialized when the collection is in a relatively stable state.
     *
     * As an example of things that go weird if the dynamic container view
     * listens to the "add" event, consider the case when the update creates
     * an item view when the collection contains only one item and a list view
     * when it contains more than one items. If the decision is taken at the
     * first "add" event, the list gets created, is initialized with the
     * collection which already contains all the items, but will still receive
     * further "add" events, which would wrongly be interpreted as "new" items.
     *
     * TODO: Consider changing the default behavior. if the view is already
     * rendered and the view receives a new collection, it should be
     * automatically updated. Note that update would likely affect running
     * code that uses the framework, so beware.
     *
     * @function
     * @param {Collection} collection Backbone collection to bind to the view
     * @param {Boolean} update Update the view when set. When not, the view
     *  will just wait for new events on the model to update itself.
     */
    setCollection: function (collection, update) {
      if (this.collection) {
        this.stopListening(this.collection);
      }

      this.collection = collection;
      this.modelsUpdated = true;

      if (collection) {
        logger.log(this.logid, 'set collection', 'update=' + !!update);
        this.listenTo(collection, 'sync', this.callIfNotRemoved(this.update));
        this.listenTo(collection, 'reset', this.callIfNotRemoved(this.update));
      }

      if (update) {
        this.update();
      }
    },


    /**
     * Updates the contents of the dynamic container if needed.
     *
     * The contents of the dynamic container need to be updated if changes
     * made to the underlying model and/or collection require the contained
     * view to change. Note no update takes place if the view has not yet been
     * rendered.
     *
     * That decision is typically up to the creator of the view who should
     * provide a "needsUpdate" function when the view is created. In the
     * absence of such a function, the dynamic container simply counts the
     * number of models associated with the view and distinguishes between the
     * following cases:
     * - no model associated with the view
     * - only one model associated with the view
     * - more than one models associated with the view
     *
     * It triggers a "render" whenever the view moves from one case to another
     * between two calls to "render/update". In particular, note the view does
     * not re-render the view when the information of a model changes or when
     * more items get added to a collection that already contained more than
     * one items. The underlying view is responsible for that.
     *
     * @function
     */
    update: function () {
      if (!this.rendered) {
        logger.log(this.logid, 'update', 'not yet rendered');
        return;
      }

      if (this.needsUpdate()) {
        logger.log(this.logid, 'update', 'needed');
        this.render();
      }
      else if (this.modelsUpdated) {
        logger.log(this.logid, 'update', 'model/collection changed');
        this.modelsUpdated = false;
        if (this.view.setModel) {
          this.view.setModel(this.model, true);
        }
        if (this.view.setCollection) {
          this.view.setCollection(this.collection, true);
        }
      }
      else {
        logger.log(this.logid, 'update', 'not needed');
      }
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
    generate: function (cb) {
      logger.log(this.logid, 'generate');

      // Save the number of models associated with the view at this time,
      // so that "update" may detect changes that would require another
      // rendering later on.
      this.modelsRendered = this.getNumberOfModels();
      this.modelsUpdated = false;

      // Create the appropriate view to encapsulate and remove the
      // previous one if it existed (note that, to avoid any flickering
      // issue, garbage collection will actually take place once the new
      // view has been rendered)
      var view = this.viewFactory();
      if (this.view && (this.view !== view)) {
        this.garbageCollect(this.view);
      }
      this.view = view;

      if (!this.view) {
        return cb(null, '');
      }
      this.listenTo(this.view, 'load', this.triggerLoad);

      // Generate the inner view from the model or collection
      if (!this.view.model && this.view.setModel) {
        this.view.setModel(this.model);
      }
      if (!this.view.collection && this.view.setCollection) {
        this.view.setCollection(this.collection);
      }

      this.view.generate(_.bind(function (err, innerHTML) {
        // The "generate" method returns the innerHTML, but we need the
        // outerHTML since that's what the inner view would generate if
        // was used on its own.
        var outerHTML = this.view.wrapContent(innerHTML);
        var html = null;
        if (outerHTML && this.template) {
          html = this.template({ child: outerHTML });
        }
        else {
          html = outerHTML ? outerHTML : '';
        }
        return cb(err, html);
      }, this));
    },


    /**
     * Marks the given view up for garbage collection, or garbage collects all
     * views that got marked up this way.
     *
     * Note that garbage collection effectively occurs when the new
     * encapsulated view has been fully rendered to avoid any flickering
     * effect.
     *
     * @function
     * @param {View} view The view to flag for garbage collection.
     *  If no view is given, the function actually performs the collection.
     */
    garbageCollect: function (view) {
      this.garbage = this.garbage || [];
      if (view) {
        this.stopListening(view);
        view.stopListening();
        this.garbage.push(view);
      }
      else {
        _.each(this.garbage, function (view) {
          view.remove();
        });
        this.garbage = [];
      }
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

      // Time to garbage collect previous view when a new view replaces
      // the previous one.
      this.garbageCollect();
    },

    setElement: function(element, delegate) {
      UIElement.prototype.setElement.call(this, element, delegate);
      this.setViewElement(delegate);
    },

    setViewElement: function(delegate) {
      if (this.view) this.view.setElement(this.el.firstChild, delegate);
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
    },

    /**
     * Triggers the "load" event. That event handler is called by the
     * underlying view when it is loaded.
     *
     * @function
     */
    triggerLoad: function () {
      logger.log(this.logid, 'trigger load');
      this.trigger('load');
    },

    /**
     * Overrides base "remove" function to forget about the underlying
     * model and collection and to propagate the request to the encapsulated
     * view.
     *
     * Note that the view is not operational anymore after a call to "remove".
     *
     * @function
     */
    remove: function () {
      logger.log(this.logid, 'remove');
      UIElement.prototype.remove.call(this);
      this.model = null;
      this.collection = null;
      this.viewFactory = null;
      this.needsUpdate = null;
      if (this.view) {
        this.view.remove();
        this.view = null;
      }
    },

    scrollTop: function() {
      this.view.scrollTop();
    }
  });


  // Expose the element to the caller
  return DynamicContainer;
});
