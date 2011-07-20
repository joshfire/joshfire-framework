/*!
 * Joshfire Framework 0.9.1
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jul 20 20:23:43 2011
 */

Joshfire.define(['joshfire/input', 'joshfire/class'],
    function(Input, Class) {



      var http = Joshfire.nodeRequire('http');

      var port = 40101;



      console.log('Req input ', port);


      return Class(Input,
          /**
          * @lends adapters_browser_inputs_http.prototype
          */
          {

            /**
            * start
            * @function
            */
            setup: function(callbackOnReady) {

              var self = this;

              http.createServer(function(req, res) {

                if (req.method == 'POST' && req.headers['content-type'] && req.headers['content-type'] == 'application/json')
                {

                  var body = '';
                  req.on('data', function(data) {
                    console.log('received data', typeof data, data);
                    body += data;
                  });

                  req.on('end', function() {

                    res.writeHead(200, {
                      'Content-Type': 'text/plain'
                    });
                    res.end('OK');

                    self.app.publish('input', [body]);
                  });
                }
                else
                {
                  console.log('error', req.headers['content-type']);
                  res.writeHead(403, {
                    'Content-Type': 'text/html'
                  });
                  res.end('<h1>Error 403</h1><h2>Method ' + req.method + ' not supported</h2>Content-type: ' + req.headers['content-type'] + '<br /><i>Should be application/json</i>\n');
                }

              }).listen(port);

              callbackOnReady();
            }
          });


    });
