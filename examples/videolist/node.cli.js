/*!
 * Joshfire Framework 0.9.0
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jun 29 16:25:37 2011
 */


Joshfire.require(['src/app.node', 'joshfire/app.factory'], function(App, Factory) {
  //Joshfire.debug=true;
  var http = Joshfire.nodeRequire('http');
  var fs = Joshfire.nodeRequire('fs');
  var path = Joshfire.nodeRequire('path');
  var url = Joshfire.nodeRequire('url');
  var serveStatic = function(filename,request,response) {
    fs.readFile(filename, 'binary', function(err, file) {
      if (err) {
        response.writeHead(500, {'Content-Type': 'text/plain'});
        response.write(err + '\n');
        response.end();
        return;
      }

      response.writeHead(200);
      response.write(file, 'binary');
      response.end();
    });
  };

  var appFactory = new Factory({},App, {});
  var server = http.createServer(function(req, res) {
    //console.log("new request",req,res);
    var uri = url.parse(req.url).pathname;
    var filename = path.join('public/', uri);
    // console.log('test fexists', filename);
    path.exists(filename, function(exists) {
      if (exists && uri != '/') {
        serveStatic(filename, req, res);
      } else {
        appFactory.buildInstance({
          'location': req.url,
          'uri': uri
        },function(err,app) {

          if (err) {
            res.writeHead(err.code, {});
            res.end('Error ' + err.code);
            return;
          }
          app.render(function(err,headers,html) {
            res.writeHead(200, headers);
            // console.log('--rendered!');
            res.end(html);
          });
        });
      }
    });
  });
  server.listen(3000);
});
