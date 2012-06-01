define(["joshlib!collection","joshlib!factorycollection","joshlib!ui/list","joshlib!router"],function(Collection, FactoryCollection, List, Router) {
	
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


	var router = Router({
		routes:{
			"":"feed1",
			"feed1":"feed1",
			"feed2":"feed2"
		},

		feed1:function() {
			c0.fetch();
		},

		feed2:function() {
			c1.fetch();
		}

	});

	router.historyStart();
	
});