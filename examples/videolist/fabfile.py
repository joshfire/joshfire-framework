from fabric.api import *
import os,sys
sys.path.append("../../build")
from joshfabric import *


def serve():

  templates()
  os.system("node joshfire/adapters/node/bootstrap.js node.cli.js")

def arduino():

  os.system("node joshfire/adapters/node/bootstrap.js arduinosocket.cli.js")


def templates():

  os.system("node joshfire/adapters/node/bootstrap.js joshfire/adapters/node/utils/templatecompiler.cli.js templates/ "+os.path.join(os.getcwd(),"templates_compiled"))
