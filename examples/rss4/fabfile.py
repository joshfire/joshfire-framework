from fabric.api import *
import os
import sys
sys.path.append("../../build")
from joshfabric import *


def export():
  local("rm -rf export/")
  local("mkdir -p export/")
  for f in ["public", "src", "joshfire"]:
    local("cp -RL %s export/" % f)


def phonegap():
  "EXPORT: export app to phonegap"
  export()
  if not os.path.isdir("phonegap"):
    print "Your phonegap project must be in phonegap/ ; We'll replace the phonegap/www/ directory"
    sys.exit(1)
  local("rm -rf phonegap/www/* && mkdir -p phonegap/www/")
  local("cp -R export/* phonegap/www/")

  switchfile = """<html>
<head>
<style>
html,body { background-color:black; }
</style>
</head>
<body>
<script>
window.location = "public/index.ios.html";
</script>
</body>
</html>
"""

  f = open("phonegap/www/index.html", "w")
  f.write(switchfile)
  f.close()
