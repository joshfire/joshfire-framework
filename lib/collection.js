/**
 * @fileoverview Base class for Joshfire datasource collections.
 *
 * This base class wraps a Joshfire Factory datasource in a Backbone
 * collection, ensuring that the "sync" method of the Backbone collection
 * calls the "find" method of the Factory datasource.
 */

define([
  'joshlib!vendor/backbone',
  'joshlib!vendor/underscore'
], function (Backbone, _) {

  var newCol = Backbone.Collection.extend({

    //TODO children
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
    initialize: function(models, options) {
      this.ds = null;
      this.dsq = {};

      options = options || {};
      if (options.dataSource) {
        this.setDataSource(options.dataSource);
      }
      if (options.dataSourceQuery) {
        this.setDataSourceQuery(options.dataSourceQuery);
      }
    },

    /**
     * Sets the datasource that the collection wraps.
     *
     * @function
     * @param {Object} ds Factory datasource object, as returned by
     *   a call to Joshfire.factory.getDataSource in the Joshfire Factory.
     */
    setDataSource: function(ds) {
      this.ds = ds;
    },

    /**
     * Sets base datasource query options.
     *
     * @function
     * @param {Object} dsq Datsource query options. These options
     *   may be extended with additional options in calls to "sync"
     */
    setDataSourceQuery: function(dsq) {
      this.dsq = dsq;
    },

    //TODO import from paginated collection
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
    sync: function(method, model, options) {
      
      /* 
      * Defence : if !this.ds, better do nothing stupid 
      * Something stupid : null.find()
      */
      if (!this.ds){
        this.trigger('syncerror', { method: method, err: 'init failed, ds is null' });
        if (options && options.error) options.error('init failed, ds is null');
        return;

      }

      options = options || {};
      var queryOptions = {};
      if (this.dsq) {
        queryOptions = _.extend(queryOptions, this.dsq);
      }
      if (options.dataSourceQuery) {
        queryOptions = _.extend(queryOptions, options.dataSourceQuery);
      }

      if (method === 'read') {
        this.trigger('syncstarted', { method: method });
        this.ds.find(queryOptions, _.bind(function (err, data) {
          if (err) {
            this.trigger('syncerror', { method: method, err: err });
            if (options.error) options.error(err);
            return;
          }

          if (this.ds.children) {
            var entries = [];
            entries = Array.prototype.concat.apply(entries, data.entries.map(function (entry) {
              return entry.entries;
            }));

            if (options.success) options.success(entries);
          } else if (options.success) {
            options.success(data.entries || []);
          }

          this.trigger('syncsuccess', {method: method});
        }, this));
      }
    }

  });

  return newCol;

});