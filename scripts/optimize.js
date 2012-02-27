var fs = require("fs"),
	path = require("path"),
	exec = require('child_process').exec;


if (process.argv.length<=2) {
	console.error("Format : optimize.js adapter main");
	process.exit(1);
}

var adapter = process.argv[2];
var mainfile = process.argv[3];


var lib_path = path.join(__dirname, "../lib");

var js_require = fs.readFileSync(lib_path+"/vendor/require.js", "utf-8");
var js_almond = fs.readFileSync(lib_path+"/vendor/almond.min.js", "utf-8");

var js_require_r = fs.readFileSync(lib_path+"/vendor/require.r.js", "utf-8");

var js_require_joshlib_plugin = fs.readFileSync(lib_path+"/joshlib.js","utf-8");

var globalnsfile = fs.readFileSync(lib_path+"/global.js", "utf-8");


var deps = [];
if (path.existsSync(lib_path+"/adapters/"+adapter+"/dependencies.json")) {
	deps = JSON.parse(fs.readFileSync(lib_path+"/adapters/"+adapter+"/dependencies.json","utf-8"));
}
var adaptermodules = JSON.parse(fs.readFileSync(lib_path+"/adapters/"+adapter+"/modules.json","utf-8"));


var nsfile = globalnsfile+fs.readFileSync(lib_path+"/adapters/"+adapter+"/global.js", "utf-8");

nsfile = nsfile.replace("JOSHFIRE_REPLACEME_ADAPTER_MODULES",JSON.stringify(adaptermodules));
nsfile = nsfile.replace("JOSHFIRE_REPLACEME_ADAPTER_DEPS",JSON.stringify(deps));
nsfile = nsfile.replace("JOSHFIRE_REPLACEME_ADAPTER_ID",JSON.stringify(adapter));


var pathfix = "Joshfire={framework:{path:\""+lib_path+"\"}};";

// We create a custom joshlib requirejs module
fs.writeFileSync("joshlib.js",pathfix+nsfile+js_require_joshlib_plugin,"utf-8");

//optimize=none
exec("node "+lib_path+"/vendor/require.r.js -o  out="+mainfile+".optimized.js name="+mainfile+" baseUrl=.",function(err,stdout,stderr) {
	
	// then remove the pathfix!
	var optimized = fs.readFileSync(mainfile+".optimized.js","utf-8");
	optimized = optimized.replace(pathfix.replace(";",""),"1");
	optimized = js_almond + optimized;
	fs.writeFileSync(mainfile+".optimized.js",optimized,"utf-8");
	
	console.error(stdout,stderr,err);
	fs.unlink("joshlib.js",function() {
		console.error("done!");
		process.exit(err?1:0);
	});
});


