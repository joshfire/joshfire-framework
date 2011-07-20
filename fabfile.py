from fabric.api import *
import fabric.colors
import os,shutil
import re
import sys
import time
import datetime


sys.path.append("build")
from joshfabric import *

try:
    import json
except:
    import simplejson as json

"""
Bootstrap generation
"""

def bootstraps():
    """
    Builds bootstrap files for each adapter
    """
    
    requirejs = open("lib/vendor/require.js").read()
    requirejs_node = open("lib/vendor/require.node.js").read()
    
    namespace = open("lib/global.js").read()
    
    adapters = os.listdir("lib/adapters/")
    
    def listSources(adapterpath):
      sources = []
      for (path, dirs, files) in os.walk("lib/adapters/%s/"%adapterpath):
          for f in files:
              if re.match('.*\.js$', f):
                  sources+=[os.path.join(path.replace("lib/adapters/%s/"%adapterpath,""),f)[0:-3]]
      
      sources.remove("global")
      try:
          sources.remove("bootstrap")
      except:
          pass
          
      return sources
    
    
    for c in adapters:
        # skip useless directories
        if( re.match('\.DS_Store', c) ):
          continue
        sources = {}
        
        namespace_adapter = open("lib/adapters/%s/global.js"%c).read()
        
        # todo replace by some jseval().
        adapter_deps = re.search("J(oshfire)?\.adapterDeps\s*\=\s*([^\;]+)\;",namespace_adapter)
        
        deps = [c]
        if adapter_deps:
          deps += json.loads(adapter_deps.group(2).replace("'",'"'))
          
        for d in deps:
          sources[d] = listSources(d)
        
        patched_namespace = namespace
        patched_namespace = patched_namespace.replace("JOSHFIRE_REPLACEME_ADAPTER_MODULES",json.dumps(sources))
        patched_namespace = patched_namespace.replace("JOSHFIRE_REPLACEME_ADAPTER_ID",json.dumps(c))
        
        bootstrap = __getCopyrightHeader() + "\n\n"

        if c=="node":
            bootstrap += patched_namespace+namespace_adapter+requirejs+requirejs_node+open("lib/adapters/%s/global.exec.js"%c).read()
            
            #patch needed in require.js
            bootstrap = bootstrap.replace("var require, define;","")
        
        else:
            bootstrap += requirejs+patched_namespace+namespace_adapter
        
        print "Writing %s ..." % ("lib/adapters/%s/bootstrap.js"%c)
        open("lib/adapters/%s/bootstrap.js"%c,"w").write(bootstrap)
        open("lib/adapters/%s/modules.json"%c,"w").write(json.dumps(sources))


def _getFinalTarGzName():
  package=json.load(open("package.json","r"))
  version=package["version"]

  finalname = "joshfire-framework-%s.tar.gz" % version
  return finalname

#release
def targz():
  
  finalname = _getFinalTarGzName()
  
  local("rm -rf export/")
  local("mkdir -p export/")
  
  local("git archive --format=tar -o export/a.tar HEAD")
  local("cd export && tar xvf a.tar && rm a.tar")
  
  #fix some files
  local("rm export/lib/uielements/forminput.js")
  
  #include optimized builds in examples
  optimizeexamples()
  local("cp -R examples/videolist/export export/examples/videolist/")
  
  local("cd export && tar czvf %s *" % finalname)
  
  return finalname
  
def prod():
  env.hosts = ['joshfire.com']
  env.path = '/home/mikiane/joshfiredocs'
  env.user = 'mikiane'  

def targzup():
  targz()
  finalname = _getFinalTarGzName()
  
  run("mkdir -p %s/shared/downloads/" % env.path)
  
  put('export/%s' % finalname, '%s/shared/downloads/%s' % (env.path,finalname))
  

"""
Code quality checking
"""


def jslint(files = 0):
    """
    Checks js files using JSLint
    """

    files = files.split(" ") if not files==0 else list_js_files()
    for file in files:
        with settings(hide("warnings", "running"), warn_only=True):
            #output = local("jslint -nologo -conf build/jsl.conf -process %s" % file, True)
            output = local("jslint %s" % file, True)
            if output.endswith("No errors found.")==True:
                print fabric.colors.green("OK ", True) + file 
            else:
                print fabric.colors.red("KO ", True) + file 
                print output[output.find("\n"):]


def jshint(files = 0):
    """
    Checks js files using JSHint
    """

    files = files.split(" ") if not files==0 else list_js_files()
    for file in files:
        with settings(hide("warnings", "running"), warn_only=True):
            output = local("jshint %s" % file, True)
            if output.endswith("OK!")==True:
                print fabric.colors.green("OK ", True) + file 
            else:
                print fabric.colors.red("KO ", True) + file 
                print output


def gjslint(files = 0):
    """
    Checks js files using gjslint for compliance with Google coding style
    """

    files = files.split(" ") if not files==0 else list_js_files()
    for file in files:
        with settings(hide("warnings", "running"), warn_only=True):
            output = local("gjslint --strict --custom_jsdoc_tags function,namespace,constructs,options,augments,static,extend %s" % file, True)
            offset = output.find("\nSome of the errors")
            if offset==-1:
                print fabric.colors.green("OK ", True) + file 
            else:
                print fabric.colors.red("KO ", True) + file 
                print output[output.find("\n"):offset]




def optimizeexamples():
    local("cd examples/videolist/ && fab optimize")

"""
Reindent & apply Google coding style
"""

"""
Generate API documentation
"""

def jsdoc(files = 0):
    files = files.split(" ") if not files==0 else list_js_files(dirs=["lib"])
    export = "doc/content/api"
    local("rm -rf ./%s/*" % export)
    local("java -jar build/jsdoc-toolkit/jsrun.jar build/jsdoc-toolkit/app/run.js -a -c=build/jsdoc-toolkit/jsdoc.conf -d=%s -t=build/jsdoc-toolkit/templates/jsdoc-tably-joshfire %s" % (export, " ".join(files)))

    """
    local("wkhtmltopdf %s/*.html %s/symbols/*.html %s/JoshfireApiReference.pdf", (export, export, export))
    local("rm -rf doc/lib/jsdoc/*")
    local("java -jar build/jsdoc-toolkit/jsrun.jar build/jsdoc-toolkit/app/run.js -a -t=build/jsdoc-toolkit/templates/jsdoc-rst -c=build/jsdoc-toolkit/jsdoc.conf -d=doc/jsdoc-html %s" % " ".join(files))
    """


def pdfdoc():
    
    print "www-joshfire must be running on localhost:40009 !"
    
    doc_content = list_js_files(dirs=["doc/content/"],excluded_dirs="api",extension=".html")
    
    requests = ["http://localhost:40009/doc/dev/%s" % re.sub("(index)?\.html$","",x[13:]) for x in doc_content]
    
    os.system("rm -rf doc/export/pdfdoc/")
    os.system("mkdir -p doc/export/pdfdoc/")
    
    output_files = []
    for r in requests:
        output_files.append("doc/export/pdfdoc/%sx.html" % r[31:])
        os.system("mkdir -p %s" % (os.path.dirname(output_files[-1])))
        os.system("curl %s -o %s" % (r,output_files[-1]))
    
    os.system("wkhtmltopdf %s doc/export/pdfdoc/JoshfireDoc.pdf" % (" ".join(output_files)))


def fix(files = 0):
    """
    Alias on fixjsstyle
    """
    fixjsstyle(files)

def fixjsstyle(files = 0):
    """
    Fix js files using fixjsstyle to comply with Google coding style
    """

    files = files.split(" ") if not files==0 else list_js_files()
    for file in files:
        with settings(hide("warnings", "running"), warn_only=True):
            output = local("fixjsstyle --strict --custom_jsdoc_tags function,namespace,constructs,options,augments,static,extend %s" % file, True)
            if output=="":
                print fabric.colors.white("CLEAN ", True) + file 
            else:
                print fabric.colors.green("FIXED ", True) + file 
                print output
        # ugly patch to indent properly JSDoc com since fixjsstyle does not
        file = open(file, "r+")
        lines = file.readlines()
        idx = 0
        while idx<len(lines):
            if lines[idx].strip()[0:2]=='/*':
                level = lines[idx].find('/*')
                idx += 1
                while idx<len(lines):
                    lines[idx] = " " * level + lines[idx].strip() + "\n"
                    if lines[idx].find('*/')!=-1:
                        break
                    idx += 1
            idx += 1
        file.seek(0)
        file.truncate()
        file.write("".join(lines))
        file.close()


def preparerelease():
    optimizeexamples()
    jsdoc()
    fixjsstyle()
    fixjsstyle()
    copyright()
    bootstraps()
    
    #todo tests once more


def copyright(files = 0):
    """
    Add copyright header to source files
    """

    header = __getCopyrightHeader().split("\n") + ['', '']
     
    # Add
    files = files.split(" ") if not files==0 else list_js_files()
    for file in files:
        name = file
        buf = open(file, "r").read()
        
        f = open(file,"w")
        f.write("\n".join(header))
        f.write(re.compile("^\s*((\/\*\!(.*?)\*\/)\s*)*",re.DOTALL).sub("",buf))
        f.close()
        
        print fabric.colors.green("COPYRIGHTED ", True) + name
        


def __getCopyrightHeader():
    """
    Add copyright header to source files
    """

    # Get framework version
    file = open('package.json', 'r')
    version = json.loads(file.read())['version']
    file.close()

    # Get header template
    file = open('build/LICENSE.HEADER', 'r')
    header = file.read()
    file.close
    now = datetime.datetime.now()
    header = header.replace('$VERSION', version).replace('$YEAR', str(now.year)).replace('$DATE', now.ctime())

    return header

