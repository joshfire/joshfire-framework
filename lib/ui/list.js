/*

  A list.

  Binds to a collection. Every item has its own view, which is created by the
  itemFactory options.

  Will also add a loading class to the DOM element when the collection is syncing.

  TODO: List should derivate from Layout

*/

define([
  "joshlib!uielement",
  "joshlib!ui/listitem",
  "joshlib!ui/item",
  "joshlib!utils/dollar",
  "joshlib!vendor/underscore",
  "joshlib!utils/i18n"
], function(
  UIElement,
  UIListItem,
  UIItem,
  $,
  _,
  i18n
) {

  var UIList = UIElement.extend({
    initialize:function(options) {
      var self = this;

      if (options.templateEl) {
        this.template = this.compileTemplate($(options.templateEl).text());
      } else if (options.template) {
        this.template = this.compileTemplate(options.template);
      } else {
        this.template = this.compileTemplate('<ul><%= children %></ul>');
      }

      this.UIItemClass = options.UIItemClass || UIListItem;
      this.itemOptions = options.itemOptions || {scroller: false};
      this.itemTemplateEl = options.itemTemplateEl;
      this.itemOptions.templateEl = this.itemOptions.templateEl || this.itemTemplateEl;
      this.itemOptions.template = this.itemOptions.template || options.itemTemplate;
      this.contentSelector = options.contentSelector;
      this.maxLength = options.maxLength || null;
      this.data = options.data || {};
      this.items = [];

      this.listItemFactory = options.listItemFactory || function(model, offset) {
        var params = {
          model: model,
          offset: offset,
          view: this.itemFactory(model, offset)
        };

        return new UIListItem(params);
      };
      this.listItemFactory = _.bind(this.listItemFactory, this);

      // Default item factory
      this.itemFactory = options.itemFactory || function(model, offset) {
        var params = {
          model: model,
          offset: offset
        };

        _.extend(params, this.itemOptions);

        return new UIItem(params);
      };

      this.childrenLeftToAdd = 0;
      this.loadMore = options.loadMore || function() {
        if (this.collection && this.childrenLeftToAdd === 0) {
          this.isLoadingMore = true;
          this.trigger("loadMoreStart");
          this.childrenLeftToAdd = this.collection.limit;
          this.collection.fetch({
            dataSourceQuery: {
              skip: this.collection.skip,
              limit: this.collection.limit
            },
            update: true,
            add: true,
            remove: false,
            success: function(coll) {
            },
            error: function(err) {
              console.log(err);
              this.isLoadingMore = false;
            }
          });
        }
      };

      this.autoLoadMore = options.autoLoadMore;

      if (this.autoLoadMore) {
        this.on('loadMoreEnd', function() {
          // Reenable loadMore when the previous one is done
          this.isLoadingMore = false;
        }, this);

        options.onScroll = options.onScroll || function(e, scrollHeight, scrollTop, scrollLeft) {
          // If we currently are doing a load more, do nothing
          if (self.isLoadingMore) return;
          if (scrollHeight - self.getLoadMoreDistance() <= scrollTop + self.$el.innerHeight()) {
            self.loadMore();
          }
        };
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
      if (this.dataLoadingClass === false) {
        this.dataLoadingClass = null;
      }

      // Propagate "shown", "hidden" events to the view's children
      this.bind('shown', function () {
        _.each(this.items, function (child) {
          child.trigger('shown');
        });
      }, this);
      this.bind('hidden', function () {
        _.each(this.items, function (child) {
          child.trigger('hidden');
        });
      }, this);

      UIElement.prototype.initialize.call(this, options);

      if (options.collection) this.setCollection(options.collection);
    },

    setCollection: function(collection, render) {
      if(this.collection) {
        this.collection.unbind('change', this.colChangedHandler, this);
        this.collection.unbind('add', this.addChild, this);
        this.collection.unbind('remove', this.colChangedHandler, this);
        this.collection.unbind('reset', this.colChangedHandler, this);
        this.collection.unbind('syncstarted', this.syncStartedHandler, this);
        this.collection.unbind('syncsuccess', this.syncSuccessHandler, this);
        this.collection.unbind('syncerror', this.syncErrorHandler, this);
      }

      this.collection = collection;
      this.newChildren = [];

      if(collection) {
        collection.bind('change', this.colChangedHandler, this);
        collection.bind('add', this.addChild, this);
        collection.bind('remove', this.colChangedHandler, this);
        collection.bind('reset', this.colChangedHandler, this);
        collection.bind('syncstarted', this.syncStartedHandler, this);
        collection.bind('syncsuccess', this.syncSuccessHandler, this);
        collection.bind('syncerror', this.syncErrorHandler, this);
      }

      this.update(render);
    },

    /**
    * Return the real height of the list, not the one of the container.
    */
    getListHeight: function() {
      return this.$el.find('.first').outerHeight();
    },

    /**
    * The load more distance is the distance from the bottom of the list for which
    * we trigger a load more.
    *
    * We need to calculate it after each load more because we do not know if the
    * height of the new items will be the same as the old ones.
    *
    * Except if overridden, it's 5 times the average item height
    **/
    calcLoadMoreDistance: function(oldListHeight, newListHeight, addedLength) {
      addedLength = addedLength || 1;
      this.loadMoreDistance = 5 * ((newListHeight - oldListHeight) / addedLength);
    },

    getLoadMoreDistance: function() {
      return this.loadMoreDistance;
    },

    /**
    *
    **/
    addChild: function(model) {
      var offset = this.items.length;
      var item = this.listItemFactory(model, offset);
      if(!this.maxLength || (this.maxLength && offset < this.maxLength)) {
        this.items.push(item);
        this.newChildren.push(item);
        this.renderChildren();
      }
    },

    /**
    * Render all the children that have been added by addChild.
    * We use _.debounce so that the renderChildren function is
    * called only when all children have been added via addChild
    */
    renderChildren: _.debounce(function() {
      var children = this.$el.find('*[data-joshfire-child]'),
          lastOffset = children.last().data('joshfire-child'),
          childrenToAdd = _.clone(this.newChildren),
          htmlToAdd = "",
          listHeightBefore, cb;

      this.newChildren = [];

      if (this.isLoadingMore) {
        listHeightBefore = this.getListHeight();
        cb = _.bind(function () {
          this.calcLoadMoreDistance(listHeightBefore, this.getListHeight(), childrenToAdd.length);
          this.trigger('loadMoreEnd');
          if (this.childrenLeftToAdd) {
            this.trigger("loadMoreLast");
          }
        }, this);
      }


      _(childrenToAdd).each(_.bind(function(item) {
        this.generateItem(_.bind(function(err, html) {
          htmlToAdd += html;
          --this.childrenLeftToAdd;
        }, this), item);
      }, this));
      children.first().siblings().last().after(htmlToAdd);
      this.setChildrenElements(lastOffset+1);

      // If we use iScroll, we need to wait for the refresh before
      // calling the callback
      if (this.hasScroller && this.iScroller) {
        this.iScroller.options.onRefresh = cb;
        window.setTimeout(_.bind(function() {
          this.iScroller.refresh();
        }, this), 0);
      } else if (cb) {
        cb();
      }
    }),

    /**
    * Allows for a developper to override it in
    * case he doesn't always need a crude render.
    **/
    colChangedHandler: function() {
      this.update(true);
    },

    update: function(render) {
      // TODO: destroy previous items?
      var size = this.maxLength ?
                  Math.min(this.collection.length, this.maxLength) :
                  this.collection.length;
      this.items = new Array(size);
      this.itemsLoaded = 0;

      var itemLoaded = function () {
        ++this.itemsLoaded;
        if (this.itemsLoaded === size && !this.wantsCustomLoadEvent) {
          // All children have been loaded
          this.trigger('load');
        }
      };

      // Create item elements
      for (var i = 0; i < size; i++) {
        var model = this.collection.at(i);
        this.items[i] = this.listItemFactory(model, i);

        // React to the "load" event of the child view,
        // triggering the "load" event of the container once
        // all children have been loaded.
        this.items[i].bind('load', _.bind(itemLoaded, this));
      }

      if(render) this.render();
    },

    setChildrenElements: function (startFrom) {
      _.each(this.items, function(item, offset) {
        if (offset < startFrom) return;
        var el = $(this.el).find('*[data-joshfire-child='+offset+']')[0];
        item.setElement(el, true);
        item.enhance();
      }, this);
    },

    generate: function(cb) {
      var items = this.items;
      var contents = new Array(items.length);
      var processed = 0;
      var template = this.template;
      var self = this;

      if(!items.length) {
        var str = template({children: '', collection: this.collection, T: i18n.getText});
        cb(null, str);
        return;
      }

      for (var i = 0; i < items.length; i++) {
        // Create a scope for the current item
        (function(item, num) {
          this.generateItem(function(err, content) {
            contents[num] = content;
            // If last item was processed, fire callback
            if(++processed === items.length) {
              var context = {children: contents.join(''), collection: self.collection};
              context = _.extend(context, self.data);
              var str = template(context);
              cb(null, str);
            }
          }, item);
        }).call(this, items[i], i);
      }
    },

    generateItem: function(cb, item) {
      item.generate(cb);
    },

    enhance: function() {
      this.setChildrenElements();
      this.$('.joshfire-link').unbind('click').bind('click', function(e) {
        e.preventDefault();
        var location = $(e.currentTarget).attr('data-joshfire-link-url');
        window.location = location;
        return false;
      });

      UIElement.prototype.enhance.call(this);

      this.calcLoadMoreDistance(0, this.getListHeight(), this.items.length);

      if (this.items.length === 0 && !this.wantsCustomLoadEvent) {
        // No children to render? That means the list is loaded
        this.trigger('load');
      }
    },

    setContent: function(html) {
      if(this.contentSelector) {
        this.$(this.contentSelector).html(html);
      } else {
        $(this.el).html(html);
      }
    },

    syncStartedHandler: function() {
      if (this.dataLoadingClass) $(this.el).addClass(this.dataLoadingClass);
    },

    syncSuccessHandler: function() {
      var self = this;
      if (this.dataLoadingClass) window.setTimeout(function () {
        $(self.el).removeClass(self.dataLoadingClass);
      }, 500);
    },

    syncErrorHandler: function() {
      if (this.dataLoadingClass) $(this.el).removeClass(this.dataLoadingClass);
    }
  });

  return UIList;
});
