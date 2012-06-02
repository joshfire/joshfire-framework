var http = require('http');
var url = require("url");
var fs = require("fs");
var requirejs = require("requirejs");

http.createServer(function (req, res) {

  //use devicedetect to detect device based on req.headers
  var startfile = "index.html";

  fs.readFile(startfile, 'utf-8', function(err, startfilecnt) {
    if (err) return res.send("Error: "+err, 500);
  
    //parse startfile to find app startjs
    var startjs = "app.js";

    if (typeof Joshfire == "undefined") {
      Joshfire = {};
    }
    Joshfire.framework = {
      "adapter":"ios" //TODO detect from startfile
    };
    Joshfire.framework.adapterDeps = JSON.parse(fs.readFileSync("../../lib/adapters/"+Joshfire.framework.adapter+"/dependencies.json"));
    Joshfire.framework.adapterModules = JSON.parse(fs.readFileSync("../../lib/adapters/"+Joshfire.framework.adapter+"/modules.json"));

    var require_instance = requirejs.config({
      context: "ctx-"+Math.random(),
      config:{
        "joshlib!view":{
          "startfilecnt":startfilecnt
        }
      },
      paths: {
            //"joshfire-framework": "../../lib",
            "joshlib":"../../lib/joshlib"
      }
    });

    require_instance([startjs.replace(/\.js$/,"")],function(startjsret) {

      //app.js should be started now.
      
      //TODO: should it return its router?

      startjsret.router.navigate(req.url);

      //wait for the router to be stale
      
      //how to get the dom state? we have no app object
      
      res.send(startjsret.router.serializehtml());

    });


  });



}).listen(5000);