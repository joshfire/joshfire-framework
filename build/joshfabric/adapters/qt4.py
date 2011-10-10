from fabric.api import *
from fabric.colors import *
import os,shutil
import re
import platform


sed = "-i ''" if 'Darwin' in platform.platform() else "-i''" 



def __replace(filename, destDir, rlist):
  for elem in rlist: 
    content = elem[1]
    if isinstance(content, str) or isinstance(content, unicode):
      content = content.replace('/', '\\/')
    local("sed %s 's/JOSHFIRE_%s/%s/g'      %s" % (sed, elem[0], content, destDir +'/'+ filename))



def export(data, me):

  destDir = me['destDir'] if 'destDir' in me else data['destDir']
  appDir = destDir +'/app/'
  srcDir = me['srcDir'] if 'srcDir' in me else data['srcDir']

  version = me['version']
  icon = me['icon']
  windows = me['windows']


  # Create dest dir
  local("rm -rf %s && mkdir -p %s" % (destDir, destDir))
  local("cp -r %s %s" % (srcDir, appDir))

  # Copy template application
  templatePath = os.path.abspath(os.path.dirname(os.path.abspath(__file__)) +"/../../adapters/qt4")
  local("cp -r %s/* %s" % (templatePath, destDir))


  # OSX | LINUX | UNIX
  # CMakeLists.txt
  file = 'CMakeLists.txt'
  list = [
    ['APP_NAME',          data['appName']]
  , ['APP_ICON_MAC_PATH', icon['mac']['path']]
  , ['APP_ICON_MAC_NAME', icon['mac']['name']]
  , ['APP_ICON_WIN_PATH', icon['win']['path']]
  , ['APP_ICON_WIN_NAME', icon['win']['name']]
  , ['VERSION_MAJOR',     version['major']]
  , ['VERSION_MINOR',     version['minor']]
  , ['VERSION_PATCH',     version['patch']]
  ]
  __replace(file, destDir, list)

  # WINDOWS
  # joshfire_win.rc
  file = 'joshfire_win.rc'
  list = [
    ['APP_ICON_WIN_PATH', icon['win']['path']]
  , ['APP_ICON_WIN_NAME', icon['win']['name']]
  ]
  __replace(file, destDir, list)

  # Joshfire.pro
  file = 'Joshfire.pro'
  list = [
    ['APP_NAME',          data['appName']]
  , ['WIN_DESTDIR',       windows['exportPath']]
  , ['WIN_SRCPATH',       ' '.join(windows['srcPath'])]
  ]
  __replace(file, destDir, list)


  # Joshfire.iss
  file = 'Joshfire.iss'
  list = [
    ['APP_NAME',          data['appName']]
  , ['VERSION_MAJOR',     version['major']]
  , ['VERSION_MINOR',     version['minor']]
  , ['VERSION_PATCH',     version['patch']]
  ]
  __replace(file, destDir, list)

  dependencies = ''
  for filename in windows['dependencies']:
    dirname = os.path.dirname(filename)
    if dirname:
      dirname = '\\' + dirname.replace('/', '\\')
    filename = filename.replace('/', '\\')
    dependencies += 'Source: "%s"; DestDir: "{app}%s"\r\n' % (filename, dirname) 

  file = open(destDir +'/'+ file, "a")
  file.write(dependencies)
  file.close()



  # COMMON

  # joshfire.h
  file = 'joshfire.h'
  list = [
    ['APP_NAME',          data['appName']]
  , ['APP_PATH',          me['index']]
  ]
  __replace(file, destDir, list)

  # app.qrc generation
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

