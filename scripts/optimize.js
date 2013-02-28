/**
 * @fileOverview Framework app optimizer.
 *
 * The optimizer uses require.js optimizer to produce an optimized version of
 * an application. It takes the selected adapter and the main JavaScript file
 * as parameter and produces a standalone JavaScript file.
 *
 * All references to Woodman are removed from the optimized code by default.
 *
 * Usage:
 *   node optimize.js [adapter] [jsfile] [minify] [traceLevels]
 *
 * The "minify" and "traceLevels" parameters are optional
 * - adapter: The name of the adapter to use for the optimization
 *    e.g.: 'android', 'ios'
 * - jsfile: Entry-point in the application to optimize without the '.js'
 *    extension
 *    e.g.: 'main' to build the 'main.js' file in the current directory
 * - minify: 'true' to minify the optimized code, 'false' to return a
 *    non-minified version of the optimized code. The optimizer minifies
 *    the code by default.
 * - traceLevels: comma-separated list of Woodman traces to leave in the app.
 *    This is only useful when the app uses Woodman. The optimizer removes
 *    all references to Woodman from the optimized code by default (value 'off')
 *    e.g.: 'all', 'warn,error', 'off'.
 *
 * The optimized writes the optimized code in a [jsfile].optimized.js file
 * in the same folder.
 *
 * TODO:
 * - options should be converted to real options: "--minify", "--traceLevels".
 * - add an "--out" option to specify the name of the final file
 */
/*global process, console, __dirname*/
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var woodmanPrecompile = require('woodman/precompile/precompile');
var UglifyJS = require('uglify-js');

// existsSync moved from "path" to "fs" in Node.js v0.8,
// keeping the fallback so that the code remains compatible with v0.6
var existsSync = fs.existsSync || path.existsSync;

/**
 * Displays info about tool usage to the console
 */
var logUsage = function () {
  var log = console.log;
  log('Usage: optimize.js [adapter] [jsfile] [minify*] [traceLevels*]');
  log(' adapter: the adapter to use, e.g. "android", "ios"');
  log(' jsfile: the JS file to optimize without its ".js" extension');
  log(' minify: whether or not to minify the code. Default is "true".');
  log(' traceLevels: comma-separated list of trace levels to keep, "off" by default');
};

// Check the number of parameters
if (process.argv.length <= 2) {
  console.error('Invalid number of parameters received');
  logUsage();
  process.exit(1);
}

// Initialize the optimization parameters
var adapter = process.argv[2];
var mainfile = process.argv[3];
var minify = true;
if (process.argv[4]) {
  minify = (process.argv[4] === 'false') ? false : true;
}
var traceLevels = [];
if (process.argv[5]) {
  traceLevels = process.argv[5].split(',');
}

var libPath = path.join(__dirname, '../lib');
var js_almond = fs.readFileSync(libPath + '/vendor/almond.min.js', 'utf-8');
var js_require_joshlib_plugin = fs.readFileSync(libPath + '/joshlib.js', 'utf-8');
var globalnsfile = fs.readFileSync(libPath + '/global.js', 'utf-8');


var deps = [];
if (existsSync(libPath + '/adapters/' + adapter + '/dependencies.json')) {
  deps = JSON.parse(fs.readFileSync(
    libPath + '/adapters/' + adapter + '/dependencies.json','utf-8'));
}
var adaptermodules = JSON.parse(fs.readFileSync(
  libPath + '/adapters/' + adapter + '/modules.json','utf-8'));


var nsfile = globalnsfile+fs.readFileSync(
  libPath + '/adapters/' + adapter + '/global.js', 'utf-8');

nsfile = nsfile.replace('JOSHFIRE_REPLACEME_ADAPTER_MODULES',
  JSON.stringify(adaptermodules, null, 2));
nsfile = nsfile.replace('JOSHFIRE_REPLACEME_ADAPTER_DEPS',
  JSON.stringify(deps, null, 2));
nsfile = nsfile.replace('JOSHFIRE_REPLACEME_ADAPTER_ID',
  JSON.stringify(adapter));

// Write the path to the Joshfire framework so that joshlib may resolve
// paths accordingly (that expressions will be removed from the optimized
// result afterwards for security reasons)
var pathfix = 'Joshfire={framework:{path:\"' + libPath + '\"}};';

// We create a custom joshlib requirejs module
fs.writeFileSync('joshlib.js',
  pathfix + nsfile + js_require_joshlib_plugin,
  'utf-8');

// Run require.js optimizer
// Note the use of "mainConfigFile" option to have require.js read
// the config from the main file.
console.log('running require.js optimizer...');
exec('node ' + libPath + '/vendor/require.r.js -o' +
  ' out=' + mainfile + '.' + adapter + '.optimized.js' +
  ' name=' + mainfile +
  ' mainConfigFile=' + mainfile + '.js' +
  ' baseUrl=.' +
  ' optimize=none', function (err, stdout, stderr) {
  // Report the result to the console
  if (err) {
    console.error(err);
    console.error('Optimization failed. See above error for details.');
    process.exit(1);
  }
  if (stderr) {
    console.error(stderr);
  }
  if (stdout) console.log(stdout);
  console.log('running require.js optimizer... done');

  // Remove the path to the Joshfire framework since it contains information
  // about the local filesystem that should not appear in the code
  console.log('removing temp path to Joshfire framework...');
  var optimized = fs.readFileSync(
    mainfile + '.' + adapter + '.optimized.js', 'utf-8');
  optimized = optimized.replace(pathfix.replace(';',''), '1');
  console.log('removing temp path to Joshfire framework... done');

  // Add Almond.js to define "define"
  optimized = js_almond + optimized;

  // Run Woodman's precompiler
  console.log('removing references to Woodman...');
  var precompilerOptions = {
    globalNames: [],
    depNames: [
      'joshlib!utils/woodman',
      'joshlib!utils/woodmanbase',
      'joshfire-framework/utils/woodman',
      'joshfire-framework/utils/woodmanbase'
    ]
  };
  if (traceLevels.length > 0) {
    precompilerOptions.keepLevel = traceLevels;
  }
  optimized = woodmanPrecompile(optimized, precompilerOptions);
  console.log('removing references to Woodman... done');

  // Minify the resulting code unless told not to
  var uglifyResult = null;
  if (minify) {
    console.log('minifying code...');
    uglifyResult = UglifyJS.minify(optimized, { fromString: true });
    optimized = uglifyResult.code;
    console.log('minifying code... done');
  }

  // Write the resulting code
  var outputFile = mainfile + '.' + adapter + '.optimized.js';
  console.log('writing final file "' + outputFile + '"...');
  fs.writeFileSync(outputFile, optimized, 'utf-8');
  console.log('writing final file "' + outputFile + '"... done');

  // Remove the dedicated "joshlib" library we created for the optimization
  console.log('removing temp joshlib library...');
  fs.unlink('joshlib.js', function () {
    console.log('removing temp joshlib library... done');
    console.log('Optimization complete!');
    process.exit(0);
  });
});


