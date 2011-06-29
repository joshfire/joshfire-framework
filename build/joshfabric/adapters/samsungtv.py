from fabric.api import *
from fabric.colors import *
import os,shutil
import re



# that method supposes you already run the optimize() method from your application directory
# and that the name of the JS and CSS file start with "samsungtv"

def exportConnectorSamsungTV( exportedPath ):
    baseUrl = "http://192.168.0.157/examples/videolist/"
    appName = "videolist-example"
    templatesPath = os.path.dirname( os.path.abspath(__file__) )."../adapters/samsungtv"
    print templatesPath
    
    if not os.path.exists( exportedPath ):
        print "provide a valid path where to get the compiled JS and CSS. You gave ".exportedPath;
        return
        
    # for production : set "./"
    finalZipPathRoot = "/home/joshfire/projects/Joshfire Dropbox techno/Dropbox/Technologie/Samsung/samsung-myskreen-couchmode/Apps/"
    if not os.path.exists(finalZipPathRoot):
        print "export build does not exist"
        return
    # project name
    finalZipPathRoot += "build"
    # remove previous builds
    if os.path.exists(finalZipPathRoot):
        shutil.rmtree(finalZipPathRoot)
        #os.rmdir(finalZipPathRoot)
    # create
    #os.mkdir(finalZipPathRoot)
    # copy the hierarchy
    shutil.copytree(templatesPath.'/structure', finalZipPathRoot)
    print "exported in "+finalZipPathRoot;
    
    # get the compiled JS and CSS files and copy them in the right place
    exportedPath
    
    # package is composed of a zip, and a xml that reference it
    zipName = '%s/%s.zip'%(finalZipPathRoot,appName)
    os.system('zip -r "%s" "%s/"' % (zipName,finalZipPathRoot) )
    # replace the values in the XML template and write to the disk
    widgetlistXML = open(templatesPath.'widgetlist.xml').read()
    widgetlistXML = widgetlistXML.replace("WIDGETNAME", appName)
    widgetlistXML = widgetlistXML.replace("ZIPSIZE", str( os.stat( zipName ).st_size ) )
    shutil.copy(templatesPath.'widgetlist.xml', finalZipPathRoot);
    open('%s/widgetlist.xml' % (finalZipPathRoot),"w").write(widgetlistXML)
