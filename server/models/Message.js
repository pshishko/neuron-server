module.exports = function (Server, config, _, pr) {

	'use strict';

	return function () {

		var service			= {};

		service.model		= Server.models.Model.instance('Message', {
            socket: 'message',
            apiAction: 'messages'
        });

		service.model.initAction(null, 'link');

		/******************************************************************************************************************/

		service.model.on('all', function(socket, data) {
			service.model.all(socket.access_token, data, function(messages, page, limit, total) {
				pr(messages);
                Server.services.Socket.sendSecureSocket('Message.onMessageAll', socket.id, {
					list: Server.services.Helper.setObjectList({}, messages),
					total: total
				});
			});
		});

		service.model.on('add', function(socket, data) {
			service.model.add(socket.access_token, data, function(message) {
				if (message.type == 'direct') {
					Server.services.Socket.sendSecureSocket('Message.onMessageAdd', message.user.id, message);
					Server.services.Socket.sendSecureSocket('Message.onMessageAdd', message.to_user.id, message);
				} else {
					Server.models.User.eachWithAccess(message.theme.room.access, true, function(role) {
						Server.services.Socket.sendSecureSocket('Message.onMessageAdd', role, message);
					});
				}
			});
		});

		service.model.on('link', function(socket, data) {
			service.model.add(socket.access_token, data, function(data) {
				Server.services.Socket.sendSecureSocketAll('Message.onMessageLink', data);
			});
		});

		service.model.on('update', function(socket, data) {
			pr(data);
			service.model.update(socket.access_token, data, function(message) {
				if (message.type == 'direct') {
					Server.services.Socket.sendSecureSocket('Message.onMessageUpdate', message.user.id, message);
					Server.services.Socket.sendSecureSocket('Message.onMessageUpdate', message.to_user.id, message);
				} else {
					Server.models.User.eachWithAccess(message.theme.room.access, true, function(role) {
						Server.services.Socket.sendSecureSocket('Message.onMessageUpdate', role, message);
					});
				}
			}, function(error) {
				Server.services.Socket.sendSecureSocket('Message.onFailMessageUpdate', socket.id, {title: error.message});
			});
		});

		service.model.on('remove', function(socket, data) {
			service.model.remove(socket.access_token, data, function(message) {
				if (message.type == 'direct') {
					Server.services.Socket.sendSecureSocket('Message.onMessageRemove', message.user.id, message);
					Server.services.Socket.sendSecureSocket('Message.onMessageRemove', message.to_user.id, message);
				} else {
					Server.models.User.eachWithAccess(message.theme.room.access, true, function(role) {
						Server.services.Socket.sendSecureSocket('Message.onMessageRemove', role, message);
					});
				}
			}, function(error) {
				Server.services.Socket.sendSecureSocket('Message.onFailMessageRemove', socket.id, {title: error.message});
			});
		});

		/******************************************************************************************************************/

		return service;
	}();
};