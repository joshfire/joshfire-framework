var fs = require("fs"),
	path = require("path"),
	diveSync = require("diveSync");


var js_require = fs.readFileSync("lib/vendor/require.js", "utf-8");
var js_require_joshlib_plugin = fs.readFileSync("lib/joshlib.js","utf-8");

var adapterlist = fs.readdirSync("lib/adapters");

var adaptermodules = {};
for (var i=0;i<adapterlist.length;i++) {
	var adapter = adapterlist[i];
	var modules = [];
	diveSync("lib/adapters/"+adapter,function(err,file) {
		var f = file.substring(("lib/adapters/"+adapter).length+1);

		if (f=="global.js" || f=="modules.json" || f=="bootstrap.js") return;
		modules.push(f.replace(/\.js$/,""));
	});

	adaptermodules[adapter] = modules;
}

var globalnsfile = fs.readFileSync("lib/global.js", "utf-8");
var data,nsfile;
for (var name in adaptermodules) {

	var deps = [];

	if (path.existsSync("lib/adapters/"+name+"/dependencies.json")) {
		deps = JSON.parse(fs.readFileSync("lib/adapters/"+name+"/dependencies.json","utf-8"));
	}

	var nsfile = globalnsfile+fs.readFileSync("lib/adapters/"+name+"/global.js", "utf-8");

	nsfile = nsfile.replace("JOSHFIRE_REPLACEME_ADAPTER_MODULES",JSON.stringify(adaptermodules));
	nsfile = nsfile.replace("JOSHFIRE_REPLACEME_ADAPTER_DEPS",JSON.stringify(deps));
	nsfile = nsfile.replace("JOSHFIRE_REPLACEME_ADAPTER_ID",JSON.stringify(name));

	data = js_require+nsfile+js_require_joshlib_plugin;

	fs.writeFileSync("lib/adapters/"+name+"/bootstrap.js",data,"utf-8");
	fs.writeFileSync("lib/adapters/"+name+"/modules.json",JSON.stringify(adaptermodules),"utf-8");
		
	console.log("Wrote lib/adapters/"+name+"/bootstrap.js");
}

