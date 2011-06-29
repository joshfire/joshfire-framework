from fabric.api import *
from fabric.colors import *
from fabric.utils import abort,warn
import os,shutil
import re
import sys

try:
    import json
except:
    import simplejson as json



def general():
  with show('everything'):
    
    failed = []
    for f in os.listdir("general/"):
      fn = "general/"+f
      if os.system("node joshfire/adapters/node/bootstrap.js runner-node.js %s" % fn):
        failed.append(fn)
      
    if len(failed):
      abort("Failed tests : %s" % failed)



def selenium(files = 0):
    """
    Performs tests in browser and collects results through Selenium
    """

    from selenium import webdriver
    from selenium.common.exceptions import NoSuchElementException
    from selenium.webdriver.common.keys import Keys
    import time
    import socket
    import subprocess


    """
    Download Selenium jar
    """
    if not os.path.isfile("../build/selenium-server-standalone.jar"):
        print "%s: %s" % (yellow("INFO", True), "You do not have ../build/selenium-server-standalone.jar, downloading it.")
        with settings(hide("warnings", "running"), warn_only=True):
            local("curl http://selenium.googlecode.com/files/selenium-server-standalone-2.0rc3.jar -o ../build/selenium-server-standalone.jar")


    """
    Launch Selenium if it is not already running
    """
    selenium = 0
    try:
        s = socket.create_connection(("localhost", 4444))
        print "%s: %s" % (yellow("INFO", True), "Selenium is already running.")
    except IOError:
        selenium = subprocess.Popen(["java", "-jar", "../build/selenium-server-standalone.jar"], stdout=None, stderr=None, stdin=None)
        dot = 1
        while 1:
            try:
                s = socket.create_connection(("localhost", 4444))
                break
            except IOError:
                print "%s: %s   \r" % (yellow("INFO", True), "Launching Selenium, please wait (it can take up to a minute!) " + ("." * (dot % 4))),
                sys.stdout.flush()
                time.sleep(0.5)
                dot += 1

    """
    Launch Node if it is not already running
    """
    node = 0
    try:
        s = socket.create_connection(("localhost", 4445))
        s.close()
        print "%s: %s" % (yellow("INFO", True), "Node instance serving tests is already running.")
    except:
        node = subprocess.Popen(["node", "server.js"], stdout=None, stderr=None, stdin=None)


    """
    Get files to test
    """     
    files = files.split(" ") if not files==0 else [] 
    for dir in ["general", "adapters"]:
        for s, d, f in os.walk(dir):
            files += [os.path.join(s, f2) for f2 in f if f2.endswith(".js")]


    """
    Performs the tests
    """     
    try:
        #browser = webdriver.Chrome()
        browser = webdriver.Firefox()
        for file in files:
            browser.get("http://localhost:4445/test/%s" % file[0:-3])
            while 1:
                try:
                    elem = browser.find_element_by_id("qunit-testresult")
                    break
                except:
                    time.sleep(0.5)
            while elem.text=="Running...":
                time.sleep(0.02)
            if elem.text.endswith("0 failed."):
                print green("OK ", True) + file 
            else:
                print red("KO ", True) + file 
                result = elem.text.split("\n")
                print "   %s" % result[1]
    finally:
        browser.close()

    if not selenium==0:
        selenium.terminate()

    if not node==0:
        node.terminate()


