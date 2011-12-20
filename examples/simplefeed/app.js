define(["joshlib!collection","joshlib!ui/list"],function(Collection, List) {
	
	var c = new Collection([],{datasource:Joshfire.factory.getDataSource("main")});

	var l = new List({
		el:"#simplefeedlist",
		itemTemplateEl:"#template-simplefeedlist",
		collection:c
	});

	c.fetch();
	
});