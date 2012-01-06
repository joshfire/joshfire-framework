define(["joshlib!vendor/backbone","joshlib!vendor/underscore","joshlib!utils/dollar"], function(Backbone, _, $) {
	
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
			$(this.el).html(html);
		},

		generate:function(cb) {
			cb(null,"");
		},

		hide:function() {
			$(this.el).hide();
		},

		show:function() {
			$(this.el).show();
		},

		enhance:function() {
			
		}
	});

	return newView;

});