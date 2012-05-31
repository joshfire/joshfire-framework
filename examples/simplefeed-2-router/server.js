var http = require('http');
var url = require("url");

http.createServer(function (req, res) {

	//use devicedetect to detect device based on req.headers
	var startfile = "index.html";

	//parse startfile to find app startjs
	var startjs = "app.js";

	requirejs(startjs,function() {

		//app.js should be started now.
		
		//TODO: should it return its router?

		router.navigate(req.url);

		//wait for the router to be stale
		
		//how to get the dom state? we have no app object
		
		res.send(app.serializehtml());

	});


});