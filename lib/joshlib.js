/* RequireJS plugin */

define("joshlib",{
	normalize: function(name,normalize) {
			
		var adapters = [Joshfire.framework.adapter].concat(Joshfire.framework.adapterDeps);
		var modules = Joshfire.framework.adapterModules;

		var path = "joshfire-framework/";

		// Name already includes a specific adapter, don't lookup
		if (name.substring(0,14)=="adapters/none/") {
			return path+name.substring(14); //Joshfire.framework.path+"/"+normalize(name.substring(14));
		} else if (name.substring(0,9)=="adapters/") {
			return path+name;
		}

		//Check in the adapter and its dependencies
		for (var i=0;i<adapters.length;i++) {
			for (var y=0;y<modules[adapters[i]].length;y++) {
				if (name==modules[adapters[i]][y]) {
					return path+"adapters/"+adapters[i]+"/"+name;
				}
			}
		}
		return path+name;
	},
    load: function (name, req, load, config) {

        //req has the same API as require().
        req([name], function (value) {
            load(value);
        });
    }
});