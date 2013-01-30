/**
 * @fileOverview Framework app optimizer.
 *
 * The optimizer uses require.js optimizer to produce an optimized version of
 * an application. It takes the selected adapter and the main JavaScript file
 * as parameter and produces a standalone JavaScript file.
 */
/*global process, console, __dirname*/
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

// existsSync moved from "path" to "fs" in Node.js v0.8,
// keeping the fallback so that the code remains compatible with v0.6
var existsSync = fs.existsSync || path.existsSync;

if (process.argv.length <= 2) {
  console.error('Format : optimize.js adapter main');
  process.exit(1);
}

var adapter = process.argv[2];
var mainfile = process.argv[3];


var lib_path = path.join(__dirname, '../lib');
var js_almond = fs.readFileSync(lib_path+'/vendor/almond.min.js', 'utf-8');
var js_require_joshlib_plugin = fs.readFileSync(lib_path+'/joshlib.js','utf-8');
var globalnsfile = fs.readFileSync(lib_path+'/global.js', 'utf-8');


var deps = [];
if (existsSync(lib_path + '/adapters/' + adapter + '/dependencies.json')) {
  deps = JSON.parse(fs.readFileSync(
    lib_path + '/adapters/' + adapter + '/dependencies.json','utf-8'));
}
var adaptermodules = JSON.parse(fs.readFileSync(
  lib_path + '/adapters/' + adapter + '/modules.json','utf-8'));


var nsfile = globalnsfile+fs.readFileSync(
  lib_path + '/adapters/' + adapter + '/global.js', 'utf-8');

nsfile = nsfile.replace('JOSHFIRE_REPLACEME_ADAPTER_MODULES',
  JSON.stringify(adaptermodules, null, 2));
nsfile = nsfile.replace('JOSHFIRE_REPLACEME_ADAPTER_DEPS',
  JSON.stringify(deps, null, 2));
nsfile = nsfile.replace('JOSHFIRE_REPLACEME_ADAPTER_ID',
  JSON.stringify(adapter));

// Write the path to the Joshfire framework so that joshlib may resolve
// paths accordingly (that sentence will be removed from the optimized
// result afterwards for security reasons)
var pathfix = 'Joshfire={framework:{path:\"' + lib_path + '\"}};';

// We create a custom joshlib requirejs module
fs.writeFileSync('joshlib.js',
  pathfix + nsfile + js_require_joshlib_plugin,
  'utf-8');

// Run require.js optimizer
// Note the use of "mainConfigFile" option to have require.js read
// the config from the main file.
exec('node ' + lib_path + '/vendor/require.r.js -o' +
  ' out=' + mainfile + '.' + adapter + '.optimized.js' +
  ' name=' + mainfile +
  ' mainConfigFile=' + mainfile + '.js' +
  ' baseUrl=.', function (err, stdout, stderr) {

  console.log(stderr,stdout);

  // Remove the path to the Joshfire framework since it contains information
  // about the local filesystem that should not appear in the code
  var optimized = fs.readFileSync(
    mainfile + '.' + adapter + '.optimized.js', 'utf-8');
  optimized = optimized.replace(pathfix.replace(';',''), '1');

  // Add Almond.js to define "define"
  optimized = js_almond + optimized;

  // Write the resulting file
  fs.writeFileSync(
    mainfile + '.' + adapter + '.optimized.js', optimized, 'utf-8');

  // Remove the dedicated "joshlib" library we created for the
  fs.unlink('joshlib.js', function () {
    console.error('done!');
    process.exit(err ? 1 : 0);
  });

  console.error(stdout, stderr, err);
});


