define(["joshlib!vendor/backbone","joshlib!vendor/underscore"], function(Backbone, _) {
	
	var newView = Backbone.View.extend({
		
		compileTemplate:_.template,

		render:function() {
			var self = this;
			this.generate(function(err,html) {
				self.setContent(html);
				self.enhance();
			});
		},

		setContent:function(html) {
			console.log("J");
			$(self.el).html(html);
		},

		generate:function(cb) {
			cb(null,"");
		},

		enhance:function() {
			
		}
	});

	return newView;

});