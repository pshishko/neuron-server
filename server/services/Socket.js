module.exports = function(Server, config, _, pr) {

    'use strict';

    return function() {
        return {
            io: null,
            events: {},
            init: function() {
                if (config.ssl.enabled) {
                    var fs = require('fs');
                    var server = require('https').createServer({
                        key: fs.readFileSync(config.ssl.key),
                        cert: fs.readFileSync(config.ssl.cert)
                    });
                } else {
                    var server = require('http').createServer();
                }
                this.io = require('socket.io')(server);
                // this.io.set({'transports': ['websocket', 'polling']});
                server.listen(config.port, function() {
                    pr('Socket server listening on '+ (config.ssl.enabled ? 'wss' : 'ws') +':' + config.port);
                });
                this.registerEvents();
            },
            onConnectSecureSocket: function(callback) {
                this.io.on('connection', function(socket) {
                    callback(socket);
                });
            },
            onDisconnectSecureSocket: function(socket, callback) {
                socket.on('disconnect', function() {
                    callback();
                });
            },
            onSecureSocket: function(socket, action, callback) {
                socket.on(action, function(data) {
                    pr(action);
                    if (data && data.data) {
                        callback(socket, data.data);
                    } else {
                        callback(socket);
                    }
                });
            },
            sendSecureSocket: function(action, token, data) {
                pr(action);
                var cryptedData = {
                    'data' : data
                };
                this.io.to(token).emit(action, cryptedData);
            },
            sendSecureSocketAll: function(action, data) {
                pr(action);
                var cryptedData = {
                    'data' : data
                };
                this.io.emit(action, cryptedData);
            },
            addEvent: function(eventName, callback) {
                this.events[eventName] = callback;
            },
            registerEvents: function () {
                var _this = this;
                Server.services.Socket.onConnectSecureSocket(function (socket) {
                    pr('add ->> ' + socket.id);

                    _.each(_this.events, function(callback, action) {
                        _this.onSecureSocket(socket, action, callback);
                    });
                    
                    Server.services.Socket.onDisconnectSecureSocket(socket, function() {
                        pr('del ->> ' + socket.id);
                        Server.models.User.disconnect(socket);
                    });
                });
            },
        };
    }();
};