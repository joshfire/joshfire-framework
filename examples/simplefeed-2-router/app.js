define(["joshlib!collection","joshlib!factorycollection","joshlib!ui/list"],function(Collection, FactoryCollection, List) {
	
	//var c = new Collection([],{datasource:Joshfire.factory.getDataSource("home")});
	var c0 = FactoryCollection("main",false,0);
	var c1 = FactoryCollection("main",false,1);


	var l0 = new List({
		el:"#simplefeedlist-1",
		itemTemplateEl:"#template-simplefeedlist",
		collection:c0,
		scroller:true
	});

	var l1 = new List({
		el:"#simplefeedlist-1",
		itemTemplateEl:"#template-simplefeedlist",
		collection:c1,
		scroller:true
	});

	c0.fetch();
	c1.fetch();
	
});