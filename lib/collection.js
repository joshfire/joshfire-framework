/**
 * @fileoverview Base class for Joshfire schema.io datasource collections.
 *
 * This base class wraps a Joshfire Factory datasource in a Backbone
 * collection, ensuring that the "sync" method of the Backbone collection
 * calls the "find" method of the Factory datasource.
 *
 * The class maintains an "hasMore" flag, set when the collection "may" have
 * more items. The flag is set initially and reset when the collection receives
 * fewer items than the number of items requested (the "limit" parameter). This
 * flag could be used by callers e.g. to display/hide a "load more" icon.
 *
 * Note this flag is more a "likely valid" information than an assertion: there
 * may be no more items to fetch when the flag is set, and this mechanism cannot
 * account for collections that receive more items from time to time.
 *
 * The class also maintains a "fetched" flag, set when the collection has been
 * fetched at least one. Note that initializing the collection with a non empty
 * set of item counts as a fetch.
 *
 * The collection triggers a series of events when it is fetched, in order:
 * - "load:start" when fetch starts
 * - "load:first" when first fetch completes, provided it returned at least one
 * item.
 * - "load:more" when a subsequent fetch completes, provided at least one new
 * item got added to the list
 * - "load:last" when fetch completes with no new items or with fewer items
 * than the requested number.
 * - "load" when fetch completes, regardless of whether new items got added to
 * the collection.
 * - "load:error" when an error occurred.
 *
 * Said differently, given a call to "fetch", the collection triggers
 * "load:start". It then triggers one of "load:first" or "load:more" if new
 * items got added to the collection, followed by a "load:last" if no items got
 * added or if fewer items than requested got added. The "load" event completes
 * the series. If an error occurs, the chain of events gets interrupted and a
 * "load:error" event is triggered.
 *
 * The "syncstarted", "syncerror" and "syncsuccess" events are deprecated.
 * They are synonymous to "load:start", "load:error", and "load" for when
 * the collection is fetched. New "update" events should be created when the
 * collection gets updated to support "save" operations.
 */

define([
  'joshlib!vendor/backbone',
  'joshlib!vendor/underscore'
], function (Backbone, _) {

  /**
   * Base wrapper around a Backbone collection that handles Joshfire schema.io
   * datasource collections.
   */
  var newCol = Backbone.Collection.extend({
    /**
     * Has the collection ever been fetched?
     */
    fetched: false,

    /**
     * Is it likely that there are more items to fetch?
     */
    hasMore: true,

    /**
     * Number of items to skip to fetch more items.
     *
     * This parameter is managed automatically based on the number of items
     * in the list.
     */
    skip: 0,

    /**
     * Number of items to request per "fetch more".
     *
     * This parameter is initialized to the number of items returned by the
     * first call to "fetch".
     */
    limit: 20,

    /**
     * Initializes the collection.
     *
     * Note that the collection is not built from a list of models but rather
     * from a datasource, given as parameter in the "options" hash.
     *
     * @function
     * @param {Object} models Defined to ensure compatibility with BackBone,
     *   but unused in practice.
     * @param {Object} options Options hash. The function sets the underlying
     *   datasource if it finds a "dataSource" property, and sets base query
     *   options if it finds a "dataSourceQuery" property.
     */
    initialize: function (models, options) {
      this.ds = null;
      this.dsq = {};
      this.hasMore = true;

      options = options || {};
      if (options.dataSource) {
        this.setDataSource(options.dataSource);
      }
      if (options.dataSourceQuery) {
        this.setDataSourceQuery(options.dataSourceQuery);
      }

      // Set the "fetched" flag the first time something gets added to
      // the collection.
      this.listenTo(this, 'add', function () {
        this.fetched = true;
      });
      this.listenTo(this, 'reset', function () {
        this.fetched = true;
      });
    },

    /**
     * Fetches more items from the source provider.
     *
     * The function requests the same number of items as was originally
     * received. For instance, if the first "fetch" request returned 20 items,
     * this function requests 20 additional items from the source provider.
     * This guarantees a consistent page size. Default page size is 20.
     *
     * The function runs asynchronously. The caller should listen to the "load"
     * events triggered by the collection to detect when fetch is over.
     *
     * @function
     */
    fetchMore: function () {
      this.fetch({
        dataSourceQuery: {
          skip: this.skip,
          limit: this.limit
        },
        update: true,
        add: true,
        remove: false
      });
    },


    /**
     * Sets the datasource that the collection wraps.
     *
     * @function
     * @param {Object} ds Factory datasource object, as returned by
     *   a call to Joshfire.factory.getDataSource in the Joshfire Factory.
     */
    setDataSource: function (ds) {
      this.ds = ds;
    },

    /**
     * Sets base datasource query options.
     *
     * @function
     * @param {Object} dsq Datsource query options. These options
     *   may be extended with additional options in calls to "sync"
     */
    setDataSourceQuery: function (dsq) {
      this.dsq = dsq;
    },

    /**
     * Fetches the underlying datasource.
     *
     * Fetch is asynchronous. The function calls "options.success"
     * or "options.error" when it's done.
     *
     * @function
     * @param {String} method The CRUD method ("create", "read", "update",
     *   or "delete"). Only "read" is supported for the time being.
     * @param {Object} model The model to be saved (or the collection to
     *   be read). Unused in practice.
     * @param {Object} options Success and error callbacks, and all other
     *   request options
     */
    sync: function (method, model, options) {
      options = options || {};
      var success = options.success || function () {};
      var error = options.error || function () {};
      var first = (this.length === 0);

      // Sanity checks to avoid running into troubles
      if (!this.ds) {
        this.trigger('load:error', {
          err: 'init failed, ds is null'
        });
        this.trigger('syncerror', {
          method: method,
          err: 'init failed, ds is null'
        });
        return error('init failed, ds is null');
      }

      // Prepare query options
      var queryOptions = {};
      if (this.dsq) {
        queryOptions = _.extend(queryOptions, this.dsq);
      }
      if (options.dataSourceQuery) {
        queryOptions = _.extend(queryOptions, options.dataSourceQuery);
      }

      // Collection is read-only (meaning it can just receive items from
      // the origin server, but cannot be modified and saved back to the
      // server afterwards), discard other types of updates.
      // Note this may be amended in the future
      if (method !== 'read') {
        this.trigger('load:error', {
          err: 'collection is read-only'
        });
        this.trigger('syncerror', {
          method: method,
          err: 'collection is read-only'
        });
        return error('Collection is read-only');
      }

      // Synchronization has started, trigger the appropriate event
      this.trigger('load:start');
      this.trigger('syncstarted', {
        method: method
      });

      this.ds.find(queryOptions, _.bind(function (err, data) {
        if (err) {
          this.trigger('load:error', {
            err: err
          });
          this.trigger('syncerror', {
            method: method,
            err: err
          });
          return error(err);
        }

        var entries = [];
        if (this.ds.children) {
          // Datasource is a multiple datasource,
          // concatenate individual lists of items.
          entries = data.entries.map(function (entry) {
            return entry.entries;
          });
        } else {
          // Datasource is an atomic datasource
          entries = data.entries || [];
        }

        // Run the success callback that sets the items in the collection
        success(entries);

        // Update the "skip", "limit" and "hasMore" flags
        if (entries.length > 0) {
          this.skip += entries.length;
          if (this.limit === 0) {
            this.limit = entries.length;
          }
        }
        if ((entries.length === 0) || (entries.length < this.limit)) {
          // We received fewer items than the number of items that were
          // initially requested. The collection is most likely full.
          this.hasMore = false;
        }

        if (entries.length > 0) {
          if (first) {
            this.trigger('load:first');
          }
          else {
            this.trigger('load:more');
          }
        }
        if (!this.hasMore) {
          this.trigger('load:last');
        }
        this.trigger('load');
        this.trigger('syncsuccess', {
          method: method
        });
      }, this));
    }

  });

  return newCol;

});