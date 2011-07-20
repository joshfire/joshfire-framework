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

Joshfire = {define: function(a,b) {_ = b();}};
require('../lib/vendor/underscore.js');

var express = require('express');
var fs = require('fs');
var expressApp = express.createServer();

testPath = __dirname + '/';
expressApp.use(express.static(testPath + 'public/'));


expressApp.get('/', function(req,res) {
  // List tests

});

expressApp.post('/testresults', function(req,res) {
  // Get results from a test

});

expressApp.get('/test/:path(*)', function(req,res) {

  var relPath = req.params.path;

  var source = fs.readFileSync(testPath + relPath + '.js', 'utf8').replace('Joshfire.define', 'Joshfire.require');

  var templateVars = {
    'path': relPath,
    'source': source
  };

  res.send(_.template(fs.readFileSync(testPath + 'template.html', 'utf8'), templateVars));

});


expressApp.listen(4445);
