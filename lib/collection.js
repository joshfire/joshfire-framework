define(["joshlib!vendor/backbone"], function(Backbone) {
	
	var newCol = Backbone.Collection.extend({
		
		//TODO children
		initialize:function(models,options) {

			if (options.datasource) {
				this.setDataSource(options.datasource);
			}
		},

		setDataSource:function(ds) {
			this.ds = ds;
		},

		//TODO import from paginated collection

		sync:function(method,model,options) {
			if (method=="read") {
				this.ds.find({},function(err,data) {
					if (err) return options.error(err);

					options.success(data.entries||[]);
				});
			}
		}

	});

	return newCol;

});