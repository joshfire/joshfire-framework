var fs = require("fs");
var path = require("path");
var exec = require('child_process').exec;

var packageFile = process.argv[2];

var build;
eval(fs.readFileSync(packageFile,"utf-8"));

//Get absolute paths
build.abs_baseUrl = path.resolve(path.dirname(packageFile),build.baseUrl);
build.abs_dir = path.resolve(path.dirname(packageFile),build.dir);

// create the export directory if it does not exist
try {
  fs.readdirSync( build.abs_dir );
} catch(e) {
  fs.mkdirSync( build.abs_dir, 0777 );
}

var readRelative = function(baseFile,relPath) {
  
  //forced relative
  if (relPath.substring(0,1)==".") {
    var f = path.resolve(path.dirname(build.abs_baseUrl+"/"+baseFile),relPath+".js");
  } else {
    var f = path.resolve(build.abs_baseUrl,relPath+".js");
  }
  
  console.log("resolved",baseFile,relPath,path.dirname(build.abs_baseUrl+"/"),"=>",f);
  return fs.readFileSync(f,"utf-8");
};


var joshfirePath = "joshfire/";



var define;

//Fix jquery's global.js
var window={};
// protect against forgotten alert()
var alert = function() {};

build.modules.forEach(function(mod) {
  
  var concatJs = "";
  
  // Include Joshfire global namespace
  concatJs += fs.readFileSync(joshfirePath+"global.js","utf-8");
  
  // Include adapter global
  concatJs += fs.readFileSync(joshfirePath+"adapters/"+mod.adapter+"/global.js","utf-8");
  
  // Fix the module list that the adapter provides
  concatJs = concatJs.replace("JOSHFIRE_REPLACEME_ADAPTER_MODULES",fs.readFileSync(joshfirePath+"adapters/"+mod.adapter+"/modules.json","utf-8"));
  concatJs = concatJs.replace("JOSHFIRE_REPLACEME_ADAPTER_ID","'"+mod.adapter+"'");
  
  // Load the Joshfire namespace in memory
  eval(concatJs);
  
  // This namespace will contain all loaded modules
  concatJs += "Joshfire.definedModules = {}; Joshfire.loadedModules = {};";
  
  // Loader function
  concatJs += "Joshfire.loadModule = function(m) {"
              +" if (!Joshfire.loadedModules[m]) {"
              +"  Joshfire.loadedModules[m]=Joshfire.definedModules[m]();"
              +"  Joshfire.definedModules[m]=true;"
              +" }"
              +" return Joshfire.loadedModules[m];"
              +"};";
  
  // Tell the app we're in production mode
  concatJs += "Joshfire.compiled = "+((new Date).getTime())+";";
  
  
  // Provide a fake require() function that loads the modules from our namespace
  concatJs += "var require = function(opts,deps,func) { "
    +"if (opts.length) { func=deps;deps=opts; } "
    +"var objs = []; "
    +"if(typeof deps === 'string') deps = [deps]; "
    +"for (var i=0;i<deps.length;i++) { "
      //+"alert(deps); "
      //+"console.log(deps); "      
      // try to correct the path
       +" if(!Joshfire.definedModules[deps[i]]) "
       +" deps[i] = '"+joshfirePath+"'+deps[i]; "
      // really not there ? throw an error
      +" if(!Joshfire.definedModules[deps[i]]) "
        +" throw new Error(deps[i]+' was not included, please reference it in build.js'); "
      +" objs.push(Joshfire.loadModule(deps[i])); "
    +"}; "
    +" func.apply(this,objs); };";
  
  var definedModules = {};
  
  var concatModules = function(baseFile,jsInclude) {
    
    //workaround the dirname call
    if (jsInclude.match("^joshfire\/") || !baseFile) {
      baseFile="x";
    }
    
    var currentModuleName = jsInclude;
    var currentModulePath = path.normalize(path.dirname(baseFile)+"/"+currentModuleName);
    
    //Already included?
    if (definedModules[currentModulePath]) return currentModulePath;
    
    //Overload the define() function so that we take the current relative path into account
    define = function(deps,func) {
      var depList = [];
      console.log("deps",deps);
      deps.forEach(function(dep) {
        var depPath = concatModules(currentModulePath,dep);
        depList.push("Joshfire.loadModule('"+depPath+"')");
      });
      definedModules[currentModulePath]=true;
      concatJs+=
        "\n\nJoshfire.definedModules['"+currentModulePath+"'] = function() { return ("+
        "\n"+func+
        "\n)("+(depList.join(","))+");"+
        "\n };";
    };
    
    //console.log("eval",baseFile,jsInclude);
    
    var src = readRelative(baseFile,jsInclude);
    
    //Find the "Joshfire.define() call" and the function source
    var m = src.match(/Joshfire\.define\(\s*(\[[\s\S]*?\])\s*\,\s*([\s\S]+\})\)\;/);
    //[\s\S]
    
    dependencies = [];
    if (m) {
        src = m[2];
        dependencies = JSON.parse(m[1].replace(/\n/g,"").replace(/\'/g,'"'));
        
        //Call Joshfire.define, it will fix the adapter dependencies and call define()
        Joshfire.define(dependencies,src);
        
    } else {
        concatJs+=src;
    }
    
    return currentModulePath;
  };
  
  
  
  mod.js.include.forEach(function(jsInclude) {
    concatModules(false,jsInclude);
  });
  
  var finalJSFile   = build.abs_dir+"/"+mod.name+'-'+mod.adapter+".js",
      finalCSSFile  = build.abs_dir+'/'+mod.name+'-'+mod.adapter+'.css';
  
  fs.writeFileSync(finalJSFile,concatJs,"utf-8");
  console.log('JS compiled to '+finalJSFile);
  
  
  if(!mod.css)
    return console.warn('No css defined, skipping it');
  
  // concatenate or compile the declared CSS files
  if(mod.css.scss && mod.css.include) {
    throw new Error('for CSS build, give either css.scss, either css.include[], but not both');
  }
  // build 
  if(mod.css.scss) {
    if(typeof mod.css.scss !== 'string')
      throw new Error('css.scss must be a string with the entry point scss file for sass to compile');
    exec('sass '+build.abs_baseUrl+'/'+mod.css.scss+' '+finalCSSFile,
      function(error, stdout, stderr) {
        if(!error) {
          console.log('CSS compiled to '+finalCSSFile);
        } else {
          console.error(error);
        }
      });
  } else if(mod.css.include) {
    if(!mod.css.include.length || typeof mod.css.include === 'string') {
      throw new Error('css.include must be an array of css files that will be concatenated together');
    }
    
    var sCSS = '';
    mod.css.include.forEach(function(cssFile) {
      //console.log( build.abs_baseUrl+'/'+cssFile );
       sCSS += '\n'+ fs.readFileSync(build.abs_baseUrl+'/'+cssFile, 'utf-8');
    });
    
    fs.writeFileSync(finalCSSFile,sCSS,"utf-8");
  }
});
