module.exports = function(Server, config, _, pr) {

	'use strict';

	return function() {

		var service	= {};
		service.model 		= Server.models.Model.instance('Room', {socket: 'room'});

		/******************************************************************************************************************/
		// service.rooms 		= service.model.observe();

		service.model.on('view', function(socket, data) {
			service.model.view(socket.access_token, data, function(room) {
				Server.services.Socket.sendSecureSocket('Room.onRoomView', socket.id, room);
			}, function(error) {
				Server.services.Socket.sendSecureSocket('Room.onFailRoomView', socket.id, error);
			});
		});

		service.model.on('all', function(socket, data) {
			service.model.all(socket.access_token, data, function(rooms, page, limit, total) {
				Server.services.Socket.sendSecureSocket('Room.onRoomAll', socket.id, {
					list: Server.services.Helper.setObjectList({}, rooms),
					total: total
				});
			}, function(error) {
				Server.services.Socket.sendSecureSocket('Room.onFailRoomAll', socket.id, {title: error.message});
			});
		});

		service.model.on('add', function(socket, data) {
			service.model.add(socket.access_token, data, function(room) {
				Server.models.User.eachWithAccess(room.access, true, function(role) {
					Server.services.Socket.sendSecureSocket('Room.onRoomAdd', role, room);
				});
			}, function(error) {
				Server.services.Socket.sendSecureSocket('Room.onFailRoomAdd', socket.id, {title: error.message});
			});
		});

		service.model.on('update', function(socket, data) {
			service.model.view(socket.access_token, data, function(oldRoom) {
				service.model.update(socket.access_token, data, function(room) {
					if (oldRoom.access < room.access) {
						Server.models.User.eachRangeAccess(oldRoom.access, room.access, function(role) {
							Server.services.Socket.sendSecureSocket('Room.onRoomRemove', role, room);
						});
					} else if (oldRoom.access > room.access) {
						Server.models.User.eachRangeAccess(room.access, oldRoom.access, function(role) {
							Server.services.Socket.sendSecureSocket('Room.onRoomAdd', role, room);
						});
					}
					Server.models.User.eachWithAccess(room.access, true, function(role) {
						Server.services.Socket.sendSecureSocket('Room.onRoomUpdate', role, room);
					});
				}, function(error) {
					Server.services.Socket.sendSecureSocket('Room.onFailRoomUpdate', socket.id, {title: error.message});
				});
			});
		});

		service.model.on('remove', function(socket, data) {
			service.model.remove(socket.access_token, data, function(room) {
				Server.models.User.eachWithAccess(room.access, true, function(role) {
					Server.services.Socket.sendSecureSocket('Room.onRoomRemove', role, room);
				});
			}, function(error) {
				Server.services.Socket.sendSecureSocket('Room.onFailRoomRemove', socket.id, {title: error.message});
			});
		});

		/******************************************************************************************************************/

		return service;
	}();
};