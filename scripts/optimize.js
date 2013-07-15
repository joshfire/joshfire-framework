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
var UAParser = require('../lib/utils/uaparser/node/parse');
var args = require('commander');

/* Everything is optional for now. Compatibility. */
args.version('0.1.0')
    .option('-a, --adapter [adapter]'           , 'Required. The adapter which should be used.')
    .option('-i, --input [input]'               , 'Required. The main file of the app.')
    .option('-m, --minify [minify]'             , 'Whether to minify or not the outputted code')
    .option('-w, --woodman [woodman]'           , 'Which levels of woodman should be kept after optimization. (Omit to remove them all)')
    .option('-u, --useragent [useragent]'       , 'A specific user agent that matches the target device\'s. Used by the devicedetect plugin.')
    .option('-d, --device [device]'             , 'The target device family (devicedetect) — i.e. : iPhone, Nexus 4...')
    .option('-f, --formfactor [formfactor]'     , 'The target device form factor (devicedetect) — i.e. : phone, tablet ...')
    .option('-s, --system [system]'             , 'The target device\'s OS — i.e. : Android, iPhone OS ...')
    .option('--systemVersion [systemversion]'   , 'The target device\'s OS\'s version — e.g. : 10.4.2')
    .option('-b, --browser [browser]'           , 'The target device\'s browser — i.e. : Mobile Safari, Chrome ...')
    .option('--browserVersion [browserversion]' , 'The target device\'s browser\'s version — e.g. : 10.4.2')
    .parse(process.argv);

// existsSync moved from "path" to "fs" in Node.js v0.8,
// keeping the fallback so that the code remains compatible with v0.6
var existsSync = fs.existsSync || path.existsSync;
/**
 * The vars that will receive the args either way
 */
var adapter;
var mainfile;
var traceLevels = [];
var minify = true;
var useragent;
var device;
var formfactor;
var system;
var systemVersion;
var browser;
var browserVersion;

/**
 * Other vars used through the script
 */
var defaultUseragent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36';
var shouldUseCustomParsedUA = false;
var customParsedUA = {
  device      : { },
  formfactor  : { },
  os          : { },
  ua          : { }
};

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

// This is a retro-compatibility test. If we have sufficient number of params but that there is no
// adapter nor a mainfile (both of which should be required), then we probably are in an old script.
if (process.argv.length > 2 && !args.adapter && !args.mainfile) {
  adapter = process.argv[2];
  mainfile = process.argv[3];
  if (process.argv[4]) {
    minify = (process.argv[4] === 'false') ? false : true;
  }
  if (process.argv[5]) {
    traceLevels = process.argv[5].split(',');
  }
  if (process.argv[6]) {
    useragent = process.argv[6] || defaultUseragent;
  }

} else {

  adapter             = args.adapter;   // These two are the minimum requirement.
  mainfile            = args.input;     // Can't set them as required yet because compatibility.
  minify              = args.minify ? args.minify : minify;
  traceLevels         = args.woodman ? args.woodman.split(',') : traceLevels;
  useragent           = args.useragent ? args.useragent : useragent;
  device              = args.device;
  formfactor          = args.formfactor;
  system              = args.system;
  browser             = args.browser;

  if (args.systemVersion) { systemVersion = args.systemVersion.split('.'); }
  if (args.browserVersion) { browserVersion = args.browserVersion.split('.'); }
  if (device || formfactor || system || browser || (systemVersion && systemVersion.length) || (browserVersion && browserVersion.length)) {

    customParsedUA.device.family      = device;
    customParsedUA.formfactor.family  = formfactor;
    customParsedUA.os.family          = system;
    customParsedUA.os.patchMinor      = null;
    customParsedUA.ua.family          = browser;

    if (systemVersion && systemVersion.length) {
      customParsedUA.os.major           = systemVersion[0];
      customParsedUA.os.minor           = systemVersion[1];
      customParsedUA.os.patch           = systemVersion[2];
    }
    if (browserVersion && browserVersion.length) {
      customParsedUA.ua.major           = browserVersion[0];
      customParsedUA.ua.minor           = browserVersion[1];
      customParsedUA.ua.patch           = browserVersion[2];
    }

    shouldUseCustomParsedUA = true;
  }
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

/**
* CREATE THE RUNTIME FILE
*
* This is used by the devicedetect plugin. At optimization, it creates and includes a runtime file
* which contains meta infos about the wished expected of the optimized app. We do this so
* when the app runs, it doesn't have to parse the UA again and (possibly wrongfuly) load files accordingly.
* It will load files according to the present fixed configuration.
**/
var runtimeFile = 'runtime.js';
var parsedUA = shouldUseCustomParsedUA ? customParsedUA : UAParser.parse(useragent);

console.log('writing runtime file "' + runtimeFile + '"...');
fs.writeFileSync(runtimeFile, 'define(' + JSON.stringify(parsedUA) + ')', 'utf-8');
console.log('writing runtime file "' + runtimeFile + '"... done');

/**
* END CREATE THE RUNTIME FILE
**/

var adapterName = (adapter === 'none' ? '' : '.' + adapter);

// Run require.js optimizer
// Note the use of "mainConfigFile" option to have require.js read
// the config from the main file.
console.log('node ' + libPath + '/vendor/require.r.js -o' +
  ' out=' + mainfile + adapterName + '.optimized.js' +
  ' name=' + mainfile +
  ' mainConfigFile=' + mainfile + '.js' +
  ' paths.runtime=' + runtimeFile.split('.')[0] +
  ' paths.devicedetect=' + libPath + '/devicedetect' +
  ' baseUrl=.' +
  ' optimize=none');

exec('node ' + libPath + '/vendor/require.r.js -o' +
  ' out=' + mainfile + adapterName + '.optimized.js' +
  ' name=' + mainfile +
  ' mainConfigFile=' + mainfile + '.js' +
  ' paths.runtime=' + runtimeFile.split('.')[0] +
  ' paths.devicedetect=' + libPath + '/devicedetect' +
  ' baseUrl=.' +
  ' optimize=none', function (err, stdout, stderr) {

  console.log('Removing temp runtime file ...');
  fs.unlink(runtimeFile, function () {
    console.log('Removing temp runtime file ... Done.');
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
      mainfile + adapterName + '.optimized.js',
      'utf-8');
    optimized = optimized.replace(pathfix.replace(';', ''), '1');
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
    if (!minify) {
      console.log('minifying code...');
      uglifyResult = UglifyJS.minify(optimized, { fromString: true });
      optimized = uglifyResult.code;
      console.log('minifying code... done');
    }

    // Write the resulting code
    var outputFile = mainfile + adapterName + '.optimized.js';
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
});


