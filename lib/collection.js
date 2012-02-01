define(["joshlib!vendor/backbone", "joshlib!vendor/underscore"], function(Backbone,_) {

	var newCol = Backbone.Collection.extend({

		//TODO children
		initialize:function(models,options) {
			this.dsq = {};

			if (options.dataSource) {
				this.setDataSource(options.dataSource);
			}
			if (options.dataSourceQuery) {
				this.setDataSourceQuery(options.dataSourceQuery);
			}
		},

		setDataSource:function(ds) {
			this.ds = ds;
		},

		setDataSourceQuery:function(dsq) {
			this.dsq = dsq;
		},

		//TODO import from paginated collection

		sync:function(method,model,options) {
			if (method == 'read') {
			  this.trigger('syncstarted', {method: method});

			  var that = this;

				this.ds.find(this.dsq,_.bind(function(err,data) {
					if (err) {
					  this.trigger('syncerror', {method: method, err: error});
					  return options.error(err);
					}

					this.trigger('syncsuccess', {method: method});
					options.success(data.entries||[]);
				}, this));
			}
		}

	});

	return newCol;

});