from fabric.api import *
import fabric.colors
import sys
import os
import json
import platform

import re,shutil

import adapters


def prod():
  """
  Generate production files (call optimize then compile)
  """

  optimize()
  compile()


def optimize():
  """
  Concatenate all files in a single one
  """

  ccPath = str(globals()["__path__"][0]) + "/../optimizer/closure-compiler"

  # Download Selenium jar
  if not os.path.isfile(ccPath + "/compiler.jar"):
    print "%s: %s" % (fabric.colors.yellow("INFO", True), "You do not have build/optimizer/closure-compiler/compiler.jar, downloading it.")
    with settings(hide("warnings", "running"), warn_only=True):
      local("curl http://closure-compiler.googlecode.com/files/compiler-latest.zip --create-dirs -o %s/latest.zip" % ccPath)
      local("unzip -d %s %s/latest.zip" % (ccPath, ccPath))

  # Run optimizer
  buildPath = str(globals()["__path__"][0]) + "/.."
  local("node %s/optimizer/concat.js build/optimize.js" % buildPath)



def compile(export_dir="export/"):
  """
  Generate compiled / minified version of the code
  """

  outPath = __getJSONFile("build/optimize.js")['dir']
  buildPath = str(globals()["__path__"][0]) + "/.."

  for f in os.listdir(export_dir):
    if f.endswith(".js") and not f.endswith(".compiled.js"):
      f = export_dir + f
      print "Compiling %s ..." % f
      fc = f.replace(".js", ".compiled.js")
      with settings(hide("warnings"), warn_only=True):
        size = [os.path.getsize(f)]

        # ugly patch to remove console call until issue 124 is resolved > https://github.com/mishoo/UglifyJS/issues/124
        fctmp = fc + ".tmp"
        local("%s/optimizer/uglify-js/bin/uglifyjs -b -ns --output %s %s" % (buildPath, fctmp, f))
        local("sed %s 's/__JOSHFIRE_REMOVE_ME;//g' %s" % ("-i ''" if 'Darwin' in platform.platform() else "-i''", fctmp))

        # --compilation_level ADVANCED_OPTIMIZATIONS
        local("java -jar %s/optimizer/closure-compiler/compiler.jar --js=%s --js_output_file=%s" % (buildPath, fctmp, fc))

        local("rm %s" % fctmp)
        continue
        
        size.append(os.path.getsize(fc))
        local("%s/optimizer/uglify-js/bin/uglifyjs --overwrite %s" % (buildPath, fc))
        size.append(os.path.getsize(fc))
        local("gzip -cf %s > %s.gz" % (fc , fc))
        size.append(os.path.getsize(fc + ".gz"))
        print "\n%s > %sko" % (fabric.colors.white(f, True), fabric.colors.yellow(size[0] / 1000, True))
        print "  %s    closure  %s%% smaller > %sko" % (fabric.colors.white(fc, True), fabric.colors.green("%.2f" % ((size[0] - size[1]) * 100 / size[0]), True), fabric.colors.yellow((size[1] / 1000), True))
        print "  %s    uglifyjs  %s%% smaller > %sko" % (fabric.colors.white(fc, True), fabric.colors.green("%.2f" % ((size[1] - size[2]) * 100 / size[1]), True), fabric.colors.yellow((size[2] / 1000), True))
        print "  %s gzipped  %s%% smaller > %sko (%s%% smaller total)\n" % (fabric.colors.white(fc + ".gz", True), fabric.colors.green("%.2f" % ((size[2] - size[3]) * 100 / size[2]), True), fabric.colors.yellow((size[3] / 1000), True), fabric.colors.green("%.2f" % ((size[0] - size[3]) * 100 / size[0]), True))



def __getJSONFile(filename):
  """
  Get output directory from build file (quite an ugly hack)
  """
  try:
    buildfile = open(filename, "r")
    tmpfile = open(filename + ".tmp.js", "w")
    tmpfile.write(buildfile.read().replace("'", "\'") + "; process.stdout.write(JSON.stringify(build));")
    tmpfile.close()
    buildfile.close()
    with settings(hide("warnings", "running", "status", "stdout"), warn_only=True):
      print 'file %s' % filename
      output = local("node %s.tmp.js && rm %s.tmp.js" % (filename, filename), True)
    return json.loads(output)
  except IOError:
    print "Error: file does not exists."



def export():
  data = __getJSONFile("build/build.js")
  for item in data["modules"]:
    adapters.__dict__[item['adapter']].export(data, item)



"""
File selection
"""


def list_js_files(**args):
    """
    Returns all JS files which need processing
    """
    
    if not args.has_key("extension"):
      args["extension"]=".js"

    dirs = ["lib", "examples", "test"]
    if args.has_key("dirs")==True:
        dirs = args["dirs"]

    if not args.has_key("excluded_dirs"):
        args["excluded_dirs"] = ["vendor", "qunit", "export", "templates_compiled", "public"]
        
    if not args.has_key("excluded_files"):
        args["excluded_files"] = ["bootstrap.js"]

    if not args.has_key("excluded_abspaths"):
        args["excluded_abspaths"] = ["test/tests.js"]

    sources = []
    for directory in dirs:
        for path, sf, files in os.walk(directory):
            if not [val for val in path.split("/") if val in args["excluded_dirs"]]:
                for file in files:
                    if not file in args["excluded_files"] and file.lower().endswith(args["extension"]):
                        abspath = os.path.join(path, file)
                        if not abspath in args["excluded_abspaths"]:
                            sources.append(abspath)
    return sources



# Helpers. These are called by other functions rather than directly
def upload_tar_from_export():

  local('cd %s && tar zcvf ../%s.tar.gz .' % (env.export_dir,env.release))
  run('mkdir %s/releases/%s' % (env.path,env.release))
  put('%s.tar.gz' % (env.release), '%s/packages/' % env.path)
  local('rm %s.tar.gz' % (env.release))
  run('cd %s/releases/%s && tar zxf ../../packages/%s.tar.gz' % (env.path,env.release,env.release))
  run('rm %s/packages/%s.tar.gz' % (env.path,env.release))


def setup_remote_environment():
  
  # setups the directory structure
  run('mkdir -p %s' % (env.path))
  run('cd %s; mkdir -p releases; mkdir -p shared; mkdir -p packages;' % (env.path))

def symlink_current_release():
  "Symlink our current release"
  run('cd %s; rm -f releases/previous; touch releases/current; mv releases/current releases/previous;' % (env.path))
  run('cd %s; ln -s %s releases/current' % (env.path,env.release))
  
def install_remote_npm():
  run('cd %s/releases/%s; npm install' % (env.path,env.release))



# that method supposes you already run the optimize() method from your application directory
# and that the name of the JS and CSS file are named "samsungtv.css" and "samsungtv.js"
def exportAdapterSamsungTV( finalZipPathRoot="./export/" ):
    #baseUrl = "http://192.168.0.114/examples/videolist/"
    baseUrl = ""
    appName = "joshfire-samsungtv"
    # for production : set "./"
    sourceFiles = os.path.abspath( os.getcwd() + '/export' )
    
    # compute the place where the templates to put in the zip are
    templatesPath = os.path.dirname( os.path.abspath(__file__) )+"/../adapters/samsungtv"
    templatesPath = os.path.abspath( templatesPath )
    
    if not os.path.exists( sourceFiles ):
        print "The source directory of the compiled JS/CSS files should be "+sourceFiles;
        return
    
    if not os.path.exists( finalZipPathRoot ):
        print "export build does not exist : "+finalZipPathRoot
        return
    
    # project name
    finalZipPathRoot += "build-samsungtv"
    # remove previous builds
    if os.path.exists(finalZipPathRoot):
        shutil.rmtree(finalZipPathRoot)
        #os.rmdir(finalZipPathRoot)
    # create
    #os.mkdir(finalZipPathRoot)
    # copy the hierarchy
    shutil.copytree(templatesPath+'/structure', finalZipPathRoot)
    print "exported in "+finalZipPathRoot;
    
    # get the compiled JS and CSS files and copy them in the right place
    for filename in os.listdir(sourceFiles):
      if(filename.endswith('-samsungtv.js')):
        shutil.copyfile(sourceFiles+'/'+filename, finalZipPathRoot+'/javascript/yourapp.js')
      if(filename.endswith('-samsungtv.css')):
        shutil.copyfile(sourceFiles+'/'+filename, finalZipPathRoot+'/css/yourapp.css')
    
    # try to get the app requireJS id from the optimize.js file
    modules = __getJSONFile("build/optimize.js")['modules']
    for module in modules:
      if(module['adapter'] == 'samsungtv'):
        appID = module['js']['include'][0]
    
    # change the J.basePath in the application
    widgetJS = open(finalZipPathRoot+'/javascript/main.js').read()
    widgetJS = widgetJS.replace("BASEURL", baseUrl)
    widgetJS = widgetJS.replace("APPID", appID)
    open(finalZipPathRoot+'/javascript/main.js', 'w').write(widgetJS)
    
    # package is composed of a zip, and a xml that reference it
    zipName = '%s/%s.zip'%(finalZipPathRoot,appName)
    os.system('zip -r "%s" "%s/"' % (zipName,finalZipPathRoot) )
    # replace the values in the XML template and write to the disk
    widgetlistXML = open(templatesPath+'/widgetlist.xml').read()
    widgetlistXML = widgetlistXML.replace("WIDGETNAME", appName)
    widgetlistXML = widgetlistXML.replace("ZIPSIZE", str( os.stat( zipName ).st_size ) )
    shutil.copy(templatesPath+'/widgetlist.xml', finalZipPathRoot);
    open('%s/widgetlist.xml' % (finalZipPathRoot),"w").write(widgetlistXML)

# will generate the files to put in the java project assets/wwww folder
# by default will put them in the export/ directory
def exportAdapterAndroid(finalExportRoot="./export/"):
    sourceFiles = os.path.abspath( os.getcwd() + '/export' )
    appName = "joshfire-android"
    
    # templates of the android project
    templatesPath = os.path.dirname( os.path.abspath(__file__) )+"/../adapters/android"
    templatesPath = os.path.abspath( templatesPath )
    
    if not os.path.exists( sourceFiles ):
        print "The source directory of the compiled JS/CSS files should be "+sourceFiles;
        return
    
    if not os.path.exists( finalExportRoot ):
        print "export build does not exist : "+finalExportRoot
        return
    
    # project name
    finalExportRoot += "build-android"
    
    if os.path.exists(finalZipPathRoot):
        shutil.rmtree(finalZipPathRoot)
    
    # get the compiled JS and CSS files and copy them in the right place
    for filename in os.listdir(sourceFiles):
      if(filename.endswith('-android.js')):
        shutil.copyfile(sourceFiles+'/'+filename, finalZipPathRoot+'/yourapp.js')
      if(filename.endswith('-android.css')):
        shutil.copyfile(sourceFiles+'/'+filename, finalZipPathRoot+'/yourapp.css')
    
    # shutil.copytree("public/images","%s/images" % (env.export_dir,))
    shutil.copy(templatesPath ,"%s/index.html" % (env.export_dir,))
    shutil.copytree(env.export_dir,"android/assets/www")
