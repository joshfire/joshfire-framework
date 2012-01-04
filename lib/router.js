define(["joshlib!vendor/backbone","joshlib!vendor/underscore"], function(Backbone, _) {
	
	var Router = function(obj) {

		_.extend(obj,{
			historyStart:function(options) {
				Backbone.history.start(options);
			}
		});

		var router = Backbone.Router.extend(obj);
		return new router();
	};

	return Router;

});