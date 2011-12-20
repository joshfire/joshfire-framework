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

/*


  // 'joshfire/uielements/list' => '[J.basePath]/adapters/DEVICE/uielements/list'
  var addAdapterToDeps = function(deps) {
    var src;

    //Lookup order is adapter, then its dependencies
    var adaptersLookup = [J.adapter].concat(J.adapterDeps);

    for (var i = 0, l = deps.length; i < l; i++) {

      //replace {adapter} by the current adapter
      deps[i] = deps[i].replace(/\{adapter\}/g, J.adapter);


      var noadapter = /^noadapter\!/.test(deps[i]);
      if (noadapter) {
        deps[i] = deps[i].substring(10);
      }



      if (/^joshfire\//.test(deps[i])) {

        var moduleName = deps[i].substring(9);

        deps[i] = J.basePath + moduleName;

        for (var ii = 0, ll = adaptersLookup.length; ii < ll && !noadapter; ii++) {
          var bFound = false;
          // If the adapter provides an implementation of this class, load it instead
          for (var iii = 0, iLength = J.adapterModules[adaptersLookup[ii]].length; iii < iLength; iii++) {
            if (J.adapterModules[adaptersLookup[ii]][iii] === moduleName) {
              deps[i] = deps[i].replace(moduleName, 'adapters/' + adaptersLookup[ii] + '/' + moduleName);
              bFound = true;
              break;
            }
          }
          if (bFound === true)
            break;
        }

      } else {
        deps[i] = J.requirePath + deps[i];
      }


    }

    return deps;
  };


*/