define(["joshlib!vendor/backbone"], function(Backbone) {
	
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
			if (method=="read") {
				this.ds.find(this.dsq,function(err,data) {
					if (err) return options.error(err);

					options.success(data.entries||[]);
				});
			}
		}

	});

	return newCol;

});