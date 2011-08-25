from fabric.api import *
from fabric.colors import *
import os,shutil
import re
import platform


def export(data, me):

  destDir = me['destDir'] if 'destDir' in me else data['destDir']
  appDir = destDir +'/app/'
  srcDir = me['srcDir'] if 'srcDir' in me else data['srcDir']

  # Create dest dir
  local("rm -rf %s && mkdir -p %s" % (destDir, destDir))
  local("cp -r %s %s" % (srcDir, appDir))

  # Copy template application
  templatePath = os.path.abspath(os.path.dirname(os.path.abspath(__file__)) +"/../../adapters/qt4")
  local("cp -r %s/* %s" % (templatePath, destDir))

  # Modify cpp files
  sed = "-i ''" if 'Darwin' in platform.platform() else "-i''" 
  local("sed %s 's/JOSHFIRE_APP_NAME/%s/g' %s" % (sed, data['appName'], destDir +'/Joshfire.desktop'))
  local("sed %s 's/JOSHFIRE_APP_NAME/%s/g' %s" % (sed, data['appName'], destDir +'/CMakeLists.txt'))
  local("sed %s 's/JOSHFIRE_APP_NAME/\"%s\"/g' %s" % (sed, data['appName'], destDir +'/joshfire.h'))
  local("sed %s 's/JOSHFIRE_APP_PATH/\"qrc:\\/%s\"/g' %s" % (sed, me['index'], destDir +'/joshfire.h'))

  # Generate qrc file
  content = ""
  tmp = ""
  rpath = "/"
  for root, subFolders, files in os.walk(appDir):
    for file in files:
      cpath = os.path.join(root, file);
      crpath = cpath[len(appDir):]
      nrpath = '/'+ crpath[:-len(file)]
      if rpath != nrpath:
        content += '  <qresource prefix="'+ rpath[:(-1 if len(rpath) > 1 else None)] +'">\n'+ tmp +'  </qresource>\n'
        rpath = nrpath
        tmp = ""
      if file[0] != ".":
        tmp += '    <file alias="'+ file +'">app/'+ crpath +'</file>\n'
  if len(tmp) != 0:
    content += '  <qresource prefix="'+ rpath[:(-1 if len(rpath) > 1 else None)] +'">\n'+ tmp +'  </qresource>\n'
  content = '<RCC>\n'+ content +'</RCC>\n'

  file = open(destDir + "/app.qrc", "w")
  file.write(content)
  file.close()

  # Finally, replace http url by qrc ones
  if 'qrc' in me:
    qrc = me['qrc']
    if 'css' in qrc:
      for file in qrc['css']:
        local('sed %s "s/url(\'/url(\'qrc:\\//g" %s%s' % (sed, appDir, file))
    if 'html' in qrc:
      for file in qrc['html']:
        local("sed %s 's/href=\"/href=\"qrc:\\//g' %s%s" % (sed, appDir, file))
        local("sed %s 's/src=\"/src=\"qrc:\\//g' %s%s" % (sed, appDir, file))

