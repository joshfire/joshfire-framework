define(["joshlib!collection"], function(Collection) {
	
	var FactoryCollection = function(dsname,dsquery,dsindex) {
		var ds = Joshfire.factory.getDataSource(dsname);
		if (typeof dsindex=="number") ds = ds.children[dsindex];
		return new Collection([],{dataSource:ds,dataSourceQuery:dsquery||{}});
	};

	return FactoryCollection;

});