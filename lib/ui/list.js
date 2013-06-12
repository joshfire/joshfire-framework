/**
 * @fileOverview Describes a possibly dynamic list.
 *
 * A list is bound to a collection. Each item in the collection gets wrapped
 * in a ListItem view before it is rendered. From a DOM perspective, this
 * creates a structure that is similar to "ul/li/[content]" although you may
 * choose to follow a more complex structure if needed.
 *
 * Items may be added to the collection using the "addChild" method.
 * The view adjusts accordingly.
 *
 * The list also implements a "load more" features that tries to load more items
 * from the collection in the background while the user scrolls the list. The
 * "load more" action gets triggered when the user has scrolled more than about
 * 75% of the list. The functionality only really works for "joshlib!collection"
 * datasource collections as the view needs to know how to request pages 2, 3...
 * of the collection.
 *
 * Options that change the behavior of the list need to be set when the list is
 * created:
 *
 * - templateEl: the DOM element or CSS selector to use to initialize the HTML
 * template for the list. The "templateEl" option is used to set the value of
 * the "template" option so both options should not be used at once.
 *
 * - template: the HTML template of the view. Value can be a string or a
 * template function. The value is first computed based on the "templateEl"
 * option. If that option is not set, the value provided is used if set. The
 * view creates a "<ul>" list otherwise.
 *
 * - collection: the Backbone collection that contains or will contain the
 * actual list of models to display within the collection.
 *
 * - itemOptions.templateEl: same as "templateEl" for an item in the list.
 * - itemOptions.template: same as "template" for an item in the list.
 * - itemOptions.*: all other options will be passed to the constructor of the
 * view created to display an item in the list.
 * - itemOptions.factory or itemFactory: the class constructor to use to create
 * the view that displays an item in the list. The function receives the
 * Backbone model to display as first parameter and the position offset as
 * second parameter. It must return a View.
 *
 * - maxLength: maximum number of items that the list may render. If the list
 * contains more items, they are ignored.
 *
 * - autoLoadMore: enables the "load more" mechanism when set.
 * - loadMore: function to use to fetch more items in the list. The function
 * receives the underlying Backbone collection as first parameter and a callback
 * function as second parameter. The callback function must be called once the
 * fetch is over.
 * - dataLoadingMoreClass: the class to use to flag the view when the load more
 * is in progress. If not given, the dataLoadingClass name is used. If value is
 * "false", the view is never flagged as loading more items.
 *
 * - customLoadEvent: when not set, the view triggers the "load" event on its
 * own once all of its children have triggered the "load" event. The view does
 * not trigger the "load" event otherwise.
 *
 * - dataLoadingClass: the name of the class used to flag the view as loading.
 * Defaults to "loading". If value is "false", the view is never flagged as
 * loading.
 *
 * Options from the Element and View base classes complete the list of options
 * available. See the description of these classes for details. Options include
 * "scroller", "scrollerSelector", "onScroll", "loadImagesSmoothly",
 * "imageClass", "getImages", "loadingClass", "processImageEl", "data".
 *
 * TODO:
 * - the list does not manage the suppression of models from the underlying
 * collection.
 * - as in most other views, data errors are not really handled
 */

define([
  'joshlib!uielement',
  'joshlib!ui/listitem',
  'joshlib!ui/item',
  'joshlib!utils/dollar',
  'joshlib!vendor/underscore',
  'joshlib!utils/i18n',
  'joshlib!utils/woodman',
  'joshlib!utils/closest_descendant'
], function(
  UIElement,
  UIListItem,
  UIItem,
  $,
  _,
  i18n,
  woodman,
  closest_descendant
) {
  var logger = woodman.getLogger('joshfire.framework.ui.list');

  /**
   * Defines a list as a view bound to a Backbone collection of models.
   *
   * The list is dynamically updated as new items get added to the collection.
   * See the above description for more details about available options.
   */
  var UIList = UIElement.extend({
    /**
     * Height of the list that is currently rendered
     */
    listHeight: 0,


    /**
     * Initializes all list options at instantiation phase.
     */
    initialize: function (options) {
      options = options || {};

      // Initialize the instance ID for logging purpose as needed
      this.initializeLogId(options);
      logger.log(this.logid, 'initialize');

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
      } else {
        this.template = this.compileTemplate('<ul><%= children %></ul>');
      }

      this.itemOptions = options.itemOptions || {scroller: false};
      this.listItemOptions = options.listItemOptions || {};
      this.itemTemplateEl = options.itemTemplateEl;
      this.itemOptions.templateEl = this.itemOptions.templateEl || this.itemTemplateEl;
      this.itemOptions.template = this.itemOptions.template || options.itemTemplate;
      this.maxLength = options.maxLength || null;
      this.data = options.data || {};
      this.items = [];

      // Default item factory
      this.itemFactory = options.itemFactory ||
        function (model, offset) {
          var params = {
            model: model,
            offset: offset
          };
          _.extend(params, this.itemOptions);
          return new UIItem(params);
        };
      this.itemFactory = _.bind(this.itemFactory, this);

      // TODO: deprecate this. The "list item" level is useless provided we
      // have a generic "wrapper" class that can be used to wrap items.
      this.listItemFactory = options.listItemFactory ||
        function (model, offset) {
          var params = {
            model: model,
            offset: offset,
            view: this.itemFactory(model, offset)
          };

          _.extend(params, this.listItemOptions);

          return new UIListItem(params);
        };

      this.listItemFactory = _.bind(this.listItemFactory, this);

      // The loadMore function fetches more items from the collection.
      // Note the collection should trigger "load:start", "load" and
      // "load:error" events for the autoLoadMore feature to work properly
      this.autoLoadMore = options.autoLoadMore;
      this.loadMore = function () {
        if (this.isLoadingMore) {
          logger.log(this.logid, 'already loading more items');
          return;
        }

        if (!this.collection || !this.collection.hasMore) {
          logger.log(this.logid, 'no more items to fetch');
          return;
        }

        logger.log(this.logid, 'loadMore');
        this.isLoadingMore = true;

        if (options.loadMore) {
          options.loadMore(this.collection);
        }
        else if (_.isFunction(this.collection.fetchMore)) {
          this.collection.fetchMore();
        }
        else {
          // No way to load more items in this collection
          logger.warn(this.logid, 'loadMore',
            'no fetchMore function available');
          this.collection.hasMore = false;
          this.isLoadingMore = false;
        }
      };

      if (this.autoLoadMore) {
        options.onScroll = options.onScroll ||
          _.bind(function (e, scrollHeight, scrollTop) {
            // If we currently are doing a load more, do nothing
            if (this.isLoadingMore) return;
            if (!this.collection.hasMore) return;
            if ((scrollHeight - this.getLoadMoreDistance()) <=
                (scrollTop + this.$el.innerHeight())) {
              logger.log(this.logid, 'loadMore', 'triggering',
                'distance=' + (scrollHeight - this.getLoadMoreDistance()),
                'height=' + (scrollTop + this.$el.innerHeight()));
              this.loadMore();
            }
          }, this);
      } else {
        options.onScroll = options.onScroll || false;
      }

      // As explained below, we need this.customLoadEvent
      // to be always true in this case. However, we
      // do need to know
      if (options.customLoadEvent) {
        this.wantsCustomLoadEvent = true;
      }

      // The list must wait for all of its children to be "loaded"
      // before it may trigger the "load" event.
      this.customLoadEvent = true;

      // Data loading class that gets added to the view's element
      // while data synchro is on. "loading" is used if not overridden
      // Set the option to false or null (and not undefined) to cancel
      // the addition of the class.
      this.dataLoadingClass = 'loading';
      if (typeof options.dataLoadingClass !== 'undefined') {
        this.dataLoadingClass = options.dataLoadingClass;
      }
      if (options.dataLoadingClass === false) {
        this.dataLoadingClass = '';
      }

      if (typeof options.dataLoadingMoreClass !== 'undefined') {
        this.dataLoadingMoreClass = options.dataLoadingMoreClass;
      }
      else {
        this.dataLoadingMoreClass = this.dataLoadingClass;
      }
      if (options.dataLoadingMoreClass === false) {
        this.dataLoadingMoreClass = '';
      }

      // Propagate "shown", "hidden" events to the view's children
      this.listenTo(this, 'shown', function () {
        _.each(this.items, function (child) {
          child.trigger('shown');
        });
      });
      this.listenTo(this, 'hidden', function () {
        _.each(this.items, function (child) {
          child.trigger('hidden');
        });
      });

      UIElement.prototype.initialize.call(this, options);

      if (options.collection) {
        this.setCollection(options.collection);
      }
    },


    /**
     * Returns the DOM element that serves as container for the list of items
     * within the view.
     *
     * The item container is defined as, in order:
     * - the element that has a "data-container" attribute
     * - the first "ul" element
     * - the first "ol" element
     * - the view's root element otherwise
     *
     * @function
     * @return {Element} The item container
     */
    getItemContainer: function () {
      var itemContainerSelector = '*[data-container], ul, ol';
      var container = closest_descendant(this.$el, itemContainerSelector);

      if (container.length === 0) {
        container = this.$el.first();
      }
      return container;
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
      this.collectionChanged = true;
      this.newChildren = [];

      if (this.collection) {
        logger.log(this.logid, 'set collection');
        this.listenTo(this.collection, 'add',
          this.callIfNotRemoved(this.addChild));
        this.listenTo(this.collection, 'remove',
          this.callIfNotRemoved(this.colChangedHandler));
        this.listenTo(this.collection, 'reset',
          this.callIfNotRemoved(this.colChangedHandler));
        this.listenTo(this.collection, 'sort',
          this.callIfNotRemoved(this.colChangedHandler));
        this.listenTo(this.collection, 'load:start',
          this.callIfNotRemoved(this.syncStartedHandler));
        this.listenTo(this.collection, 'load',
          this.callIfNotRemoved(this.syncSuccessHandler));
        this.listenTo(this.collection, 'load:error',
          this.callIfNotRemoved(this.syncErrorHandler));
      }

      if (update) {
        this.update();
      }
    },


    /**
     * Return the real height of the list, not the one of the container.
     */
    getListHeight: function() {
      return this.$el.find('.first').outerHeight();
    },


    /**
     * The load more distance is the distance from the bottom of the list which,
     * when reached through scrolling, triggers a "load more".
     *
     * The distance needs to be computed after each "load more" as there are no
     * guarantees that the height of the new items is the same as the height of
     * the items that are already rendered.
     *
     * Except if overridden, the distance is 75% of the height of the list
     *
     * @function
     * @param {integer} nbAdded Number of items added since last call
     **/
    updateLoadMoreDistance: function () {
      var listHeight = this.getListHeight() || 200;
      this.loadMoreDistance = 25 / 100 * listHeight;
      logger.log(this.logid, 'loadMoreDistance=' + this.loadMoreDistance);
    },

    /**
     * Returns the "load more" distance.
     */
    getLoadMoreDistance: function () {
      return this.loadMoreDistance;
    },

    /**
     * Adds a new item to the view.
     *
     * The function should never be called manually. It is called automatically
     * as new items get added to the underlying collection.
     *
     * The function ensures the new child may be added to the view and creates
     * the appropriate child view provided the view has already been rendered.
     *
     * @function
     * @private
     * @param {Model} model The item's model to add to the view
     **/
    addChild: function (model) {
      var offset = this.items.length;
      logger.log(this.logid, 'addChild',
        'offset=' + offset,
        'model=' + (model.get('name') || model.id || model.cid));
      var item = this.listItemFactory(model, offset);
      if(!this.maxLength || (this.maxLength && offset < this.maxLength)) {
        this.items.push(item);
        if (this.rendered) {
          this.newChildren.push(item);
          this.renderChildren();
        }
      }
    },


    /**
     * Renders children that have been added by addChild and that have not yet
     * been rendered.
     *
     * Note the use of _.debounce so that the renderChildren function is
     * called only once all children have been added via "addChild" in this
     * tick.
     *
     * The function triggers a "render:children" event when rendering is over
     * to let callers perform further actions as needed.
     *
     * @function
     * @private
     */
    renderChildren: _.debounce(function () {
      var itemContainer = this.getItemContainer();
      // TODO: lastOffset may be null if list had 0 children!
      var lastOffset = itemContainer.children().last().data('joshfire-child');
      var htmlToAdd = '';

      logger.log(this.logid, 'renderChildren',
        'items=' + this.newChildren.length);

      // TODO: in theory, "generate" may be async but this code assumes
      // that the function runs synchronously!
      _(this.newChildren).each(_.bind(function (item) {
        item.generate(_.bind(function (err, html) {
          htmlToAdd += html;
        }, this));
      }, this));
      itemContainer.append(htmlToAdd);

      this.setChildrenElements(lastOffset + 1);
      this.newChildren = [];
      this.childrenLeftToAdd = 0;

      // If we use iScroll, we need to wait for the refresh before
      // calling the callback
      if (this.hasScroller && this.iScroller) {
        this.iScroller.options.onRefresh = _.once(_.bind(function () {
          this.updateLoadMoreDistance();
          this.isLoadingMore = false;
          this.trigger('render:children');
        }, this));
        _.defer(_.bind(function () {
          this.iScroller.refresh();
        }, this));
      } else {
        this.updateLoadMoreDistance();
        this.isLoadingMore = false;
        this.trigger('render:children');
      }
    }),


    /**
     * Reacts to a change made to the collection bound to the view.
     *
     * Note this handler serves no purpose whatsoever on top of "update" now
     * that update has been re-written. It is merely kept for backward
     * compatibility purpose. Derived classes that want to override the default
     * behavior should rather override the "update" function.
     *
     * TODO: deprecate and remove this function.
     *
     * @function
     */
    colChangedHandler: function () {
      logger.log(this.logid, 'colChangedHandler');
      this.update();
    },


    /**
     * Updates the contents of the view when the model changes
     *
     * Default implementation re-renders the view whenever a change is detected,
     * unless the view has not yet been rendered.
     *
     * Classes that derive this class may want to override that function to
     * provide a smarter mechanism, in particular not to update the underlying
     * view if it does not need to be updated.
     *
     * @function
     */
    update: function () {
      logger.log(this.logid, 'update');

      // Mark the collection as changed so that children views get re-created
      this.collectionChanged = true;
      if (!this.rendered) return;
      this.render();
    },


    /**
     * Builds the list of children views associated with each model in the
     * collection bound to the list.
     *
     * Possible former children views are garbage collected.
     *
     * @function
     */
    createChildrenViews: function () {
      logger.log(this.logid, 'create children views');

      // Compute the size of the new list
      var size = this.maxLength ?
        Math.min(this.collection.length, this.maxLength) :
        this.collection.length;

      // Mark existing items as "ready to be garbage collected". Garbage
      // collection should take place after rendering of the new items to
      // avoid possible flickering effects if we collected them right away.
      _.each(this.items, function (item) {
        this.garbageCollect(item);
      }, this);

      this.collectionChanged = false;
      this.items = new Array(size);

      // Sets the view loaded counter. The list will trigger a "load" event
      // once all of its children views have triggered theirs.
      this.itemsLoaded = 0;
      var itemLoaded = function () {
        ++this.itemsLoaded;
        if ((this.itemsLoaded === size) && !this.wantsCustomLoadEvent) {
          // All children have been loaded
          this.trigger('load');
        }
      };

      // Create item elements
      this.collection.some(function (model, i) {
        if (i >= size) {
          // break
          return true;
        }

        this.items[i] = this.listItemFactory(model, i);

        // React to the "load" event of the child view,
        // triggering the "load" event of the container once
        // all children have been loaded.
        this.listenTo(this.items[i], 'load', _.bind(itemLoaded, this));
      }, this);
    },


    /**
     * Updates the DOM root element of all children views.
     *
     * @function
     * @param {integer} startForm Index of the child to start from,
     *   defaults to 0.
     */
    setChildrenElements: function (startFrom) {
      var a = 0, b = 0, c= 0;
      var t;
      var container = this.getItemContainer();
      _.each(this.items, function (item, offset) {
        if (offset < startFrom) return;

        var tagName = item.tagName || '*';
        var el = container.find('> ' + tagName + '[data-joshfire-child=' + offset + ']')[0];
        //var el = closest_descendant(this.$el, '*[data-joshfire-child=' + offset + ']')[0];
        item.setElement(el, true);
        item.enhance();
      }, this);
      if (this.id === 'contacts') alert(a + '/' + b + '/' + c);
    },


    /**
     * Generates the view's HTML content for the underlying model.
     *
     * The HTML content generated is the inner HTML of the view, i.e. it
     * does not include the wrapping element of the view (this.el).
     *
     * Despite the presence of a callback function, note generation is
     * synchronous.
     *
     * The generate function is called as first step of the rendering process.
     *
     * @function
     * @param {function} cb Callback function
     */
    generate: function (cb) {
      cb = cb || function () {};
      var processed = 0;
      var template = this.template;
      var self = this;

      // (Re-)create children views if needed
      if (!this.items || this.collectionChanged) {
        this.createChildrenViews();
      }
      var items = this.items;

      // Render an empty view if there are no items to render
      if (!items || !items.length) {
        logger.log(this.logid, 'generate', 'empty list');
        var context = {
          children: '',
          collection: this.collection,
          T: i18n.getText
        };
        context = _.extend(context, this.data);
        var str = template(context);

        return cb(null, str);
      }

      var contents = new Array(items.length);

      // Get the HTML of all children
      logger.log(this.logid, 'generate', 'items=' + items.length);
      for (var i = 0; i < items.length; i++) {
        // Create a scope for the current item
        (function (item, num) {
          item.generate(function (err, content) {
            contents[num] = content;
            // If last item was processed, fire callback
            if (++processed === items.length) {
              var context = {
                children: contents.join(''),
                collection: self.collection,
                T: i18n.getText
              };
              context = _.extend(context, self.data);
              var str = template(context);
              cb(null, str);
            }
          });
        }).call(this, items[i], i);
      }
    },

    /**
     * Set view events handler as needed.
     *
     * The enhance function is called as last part of the rendering process.
     */
    enhance: function () {
      logger.log(this.logid, 'enhance');

      // The HTML of the view has changed, we need to update the root element
      // of each child view
      this.setChildrenElements();

      // Bind click event to specific "Joshfire" links
      this.$('.joshfire-link').off('click').on('click', function (e) {
        e.preventDefault();
        var location = $(e.currentTarget).attr('data-joshfire-link-url');
        window.location = location;
        return false;
      });

      // Garbage collect previous children views if needed
      this.garbageCollect();

      // Call base class for more logic
      UIElement.prototype.enhance.call(this);

      // Compute the "load more" distance (even if the feature is not enabled)
      this.updateLoadMoreDistance(this.items.length);

      // Trigger the "load" event if there are no children to render,
      // unless the creator of the view wants to handle the event on his own
      if ((this.items.length === 0) && !this.wantsCustomLoadEvent) {
        this.trigger('load');
      }
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
     * Overrides base "remove" function to forget about the underlying
     * collection and to propagate the request to the view's children.
     *
     * Note that the view is not operational anymore after a call to "remove".
     *
     * @function
     */
    remove: function () {
      logger.log(this.logid, 'remove');
      UIElement.prototype.remove.call(this);
      _.each(this.items, function (item) {
        item.remove();
      });
      this.collection = null;
      this.items = [];
      this.newChildren = [];
      this.itemFactory = null;
      this.listItemFactory = null;
      this.loadMore = null;
    },

    /**
     * Flags the view as "loading" when the underlying collection is being
     * fetched.
     *
     * Note the fetch may be the result of rendering the view, triggering a
     * "load more", or some other view fetching the collection elsewhere in
     * the application.
     */
    syncStartedHandler: function() {
      var loadingClass = null;
      if (this.isLoadingMore) {
        loadingClass = this.dataLoadingMoreClass;
      }
      else {
        loadingClass = this.dataLoadingClass;
      }
      logger.log(this.logid, 'fetch collection items',
        'isLoadingMore=' + !!this.isLoadingMore,
        'loadingClass=' + loadingClass);
      this.$el.addClass(loadingClass);
      if (this.hasScroller && this.iScroller) {
        _.defer(_.bind(this.iScroller.refresh, this.iScroller));
      }
    },


    /**
     * Success handler for a fetch operation on the collection.
     */
    syncSuccessHandler: function() {
      logger.log(this.logid, 'fetch collection items', 'done');
      if (!this.newChildren || (this.newChildren.length === 0)) {
        // All new children have been added to the DOM,
        // consider we're done with loading
        this.isLoadingMore = false;
      }
      if (this.dataLoadingMoreClass) {
        this.$el.removeClass(this.dataLoadingMoreClass);
      }
      if (this.dataLoadingClass) {
        this.$el.removeClass(this.dataLoadingClass);
      }
      if (this.hasScroller && this.iScroller) {
        _.defer(_.bind(this.iScroller.refresh, this.iScroller));
      }
    },


    /**
     * Error handler for a fetch operation on the collection
     */
    syncErrorHandler: function (res) {
      logger.error(this.logid, 'fetch collection items', 'error', res.err);
      this.isLoadingMore = false;
      if (this.dataLoadingMoreClass) {
        this.$el.removeClass(this.dataLoadingMoreClass);
      }
      if (this.dataLoadingClass) {
        this.$el.removeClass(this.dataLoadingClass);
      }
      if (this.hasScroller && this.iScroller) {
        _.defer(_.bind(this.iScroller.refresh, this.iScroller));
      }
    }
  });

  return UIList;
});
