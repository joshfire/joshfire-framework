define(["joshlib!collection"], function(Collection) {
	
	var FactoryCollection = function(dsname,dsquery) {
		var ds = Joshfire.factory.getDataSource(dsname);
		return new Collection([],{dataSource:ds,dataSourceQuery:dsquery||{}});
	};

	return FactoryCollection;

});