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

Joshfire.define(['joshfire/class', 'joshfire/vendor/underscore'], function(Class, _) {

  var express = Joshfire.nodeRequire('express');
  var socketio = Joshfire.nodeRequire('socket.io');



  return Class({

    __constructor: function(app,options) {
      this.app = app;
      this.options = _.extend({
        source: this.app,
        port: 8080
      },options);
    },

    setup: function(callback) {
      var self = this;

      var expressApp = express.createServer();
      var io = socketio.listen(expressApp);

      expressApp.listen(this.options.port);

      io.sockets.on('connection', function(socket) {

        //Forward all events through the websocket
        self.options.source.subscribe('*', function(ev,data) {
          socket.emit(ev, data);
        });

      });

      callback();

    }

  });


});
