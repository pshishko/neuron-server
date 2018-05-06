module.exports = function (Server, config, _, pr) {

	'use strict';

	return function () {

		var service	= {};
		service.model			= Server.models.Model.instance('Photo', {
			socket: 'photo',
			// apiAction: 'photo'
		});

		/******************************************************************************************************************/
		service.photos 		= service.model.observe();
		
		service.model.on('all', function(socket, data) {
			if (service.photos.isLoaded(data)) {
				Server.services.Socket.sendSecureSocket('Photo.onPhotoAll', socket.id, {
					list: service.photos.get(data),
					total: service.photos.total
				});
			} else {
				service.model.all(socket.access_token, data, function(photos, page, limit, total) {
					service.photos.set(photos, total);
					Server.services.Socket.sendSecureSocket('Photo.onPhotoAll', socket.id, {
						list: service.photos.get(data),
						total: total
					});
				}, function(error) {
					Server.services.Socket.sendSecureSocket('Photo.onFailPhotoAll', socket.id, error.errors);
				});
			}
		});

		service.model.on('add', function(socket, data) {
			service.model.add(socket.access_token, data, function(photo) {
				service.photos.add(photo);
				Server.services.Socket.sendSecureSocket('Photo.onPhotoAdd', 'admin', photo);
			}, function(error) {
				Server.services.Socket.sendSecureSocket('Photo.onFailPhotoAdd', socket.id, {title: error.message});
			});
		});

		service.model.on('update', function(socket, data) {
			service.model.update(socket.access_token, data, function(photo) {
				service.photos.update(photo.id, photo);
				Server.services.Socket.sendSecureSocket('Photo.onPhotoUpdate', 'admin', photo);
			}, function(error) {
				Server.services.Socket.sendSecureSocket('Photo.onFailPhotoUpdate', socket.id, {title: error.message});
			});
		});

		service.model.on('remove', function(socket, data) {
			service.model.remove(socket.access_token, data, function(photo) {
				service.photos.remove(photo.id);
				Server.services.Socket.sendSecureSocket('Photo.onPhotoRemove', 'admin', photo);
			});
		});

		/******************************************************************************************************************/

		return service;
	}();
};