module.exports = function (Server, config, _, dd) {

	'use strict';

	return function () {

		var service		= {};
		service.model	= Server.models.Model.instance('User', {socket: 'user'});

		service.model.initAction(null, 'login');
		service.model.initAction(null, 'register');
        service.model.initAction(null, 'forgot');
		service.model.initAction(null, 'reset');
		service.model.initAction(null, 'logout');
		service.model.initAction(null, 'online');
		service.model.initAction(null, 'uploadPhoto');
		service.model.initAction(null, 'removePhoto');
		service.model.initAction(null, 'photo');

		service.users	= service.model.observe();
		service.photos 	= {}
		//Server.services.Crypt.getKey();

		service.getUserPhotos = function(userId) {
			if (!service.photos[userId]) {
				service.photos[userId] = service.model.observe();
			}
			return service.photos[userId];
		};

		service.getAccessRoleList = function() {
			return {
				10: 'member',
				20: 'contributor',
				30: 'editor',
				40: 'moderator',
				50: 'admin'
			};
		};

		service.eachWithAccess = function(currentAccess, needAccess, callback) {
			_.each(service.getAccessRoleList(), function(role, access) {
				if ((needAccess && currentAccess <= access) || (!needAccess && currentAccess > access)) {
					callback(role);
				}
			});
		};

		service.eachRangeAccess = function(fromAccess, toAccess, callback) {
			var roleList = service.getAccessRoleList();
			for (var access = fromAccess; access < toAccess; access = access + 10) {
				callback(roleList[access]);
			}
		};

		/******************************************************************************************************************/
		
		Server.services.Socket.addEvent('User.connect', function(socket, user) {
			dd('connect');
			if (user && user.access_token && user.access_token !== 'undefined') {
				service.getProfile(socket, user.access_token, function(user) {
					service.addConnection(socket, user);
					Server.services.Socket.sendSecureSocket('Auth.onConnect', socket.id, user);
				}, function(error) { pr(error);
					service.logout(socket);
				});
			} else {
				Server.services.Socket.sendSecureSocket('Auth.onConnect', socket.id, {role: 'guest'});
			}
		});

		service.disconnect = function(socket) {
			dd('disconnect');
			this.removeConnection(socket);
		};

		service.addConnection = function(socket, user) {
            dd(123);
			this.joinChannel(socket, 'uid', user.id);
			this.joinChannel(socket, 'access', user.access_token);
			this.joinChannel(socket, 'role', user.role);

			var userIdWithAccess = user.id + '/' + user.access_token;
			if (!this.users.exist(userIdWithAccess)) {
				user.connections = 0;
				this.users.add(user, userIdWithAccess);
			}
			this.users.get()[userIdWithAccess].connections++;
			// Server.models.Users.updateActiveUser(this.getChannelKey(socket, 'uid'));
		};

		service.removeConnection = function(socket, force) {
			var userIdWithAccess = this.getChannelKey(socket, 'uid') + '/' + this.getChannelKey(socket, 'access');
			if (this.users.exist(userIdWithAccess)) {
				this.users.get()[userIdWithAccess].connections--;
				if (force || this.users.get()[userIdWithAccess].connections <= 0) {
					this.users.remove(userIdWithAccess);
				}
			}
			// Server.models.Users.updateActiveUser(this.getChannelKey(socket, 'uid'));
		};

		service.model.on('login', function(socket, auth) {
			Server.services.Api.auth('auth/token', auth, function(access) {
				service.getProfile(socket, access, function(user) {
					service.addConnection(socket, user);
					Server.services.Socket.sendSecureSocket('User.onUserLogin', socket.id, user);
				});
			}, function(error) {
                pr(error);
				Server.services.Socket.sendSecureSocket('User.onFailUserLogin', socket.id, {email: error.message});
			});
		});

		service.model.on('register', function(socket, auth) {
			Server.services.Api.auth('auth/register', auth, function(access) {
				service.getProfile(socket, access, function(user) {
					service.addConnection(socket, user);
					Server.services.Socket.sendSecureSocket('User.onUserRegister', socket.id, user);
				});
			}, function(error) {
				Server.services.Socket.sendSecureSocket('User.onFailUserRegister', socket.id, {email: error.message});
			});
		});

        service.model.on('forgot', function(socket, auth) {
            Server.services.Api.post('auth/forgot', socket.access_token, auth, function(data) {
                Server.services.Socket.sendSecureSocket('User.onUserForgot', socket.id, {message: data.message});
            }, function(error) {
                Server.services.Socket.sendSecureSocket('User.onFailUserForgot', socket.id, {email: error.message});
            });
        });

        service.model.on('reset', function(socket, auth) {
			Server.services.Api.post('auth/reset', socket.access_token, auth, function(data) {
                pr(data);
                Server.services.Socket.sendSecureSocket('User.onUserReset', socket.id, {message: data.message});
			}, function(error) {
				Server.services.Socket.sendSecureSocket('User.onFailUserReset', socket.id, {key: error.message});
			});
		});

		service.model.on('update', function(socket, data) {
			service.model.update(socket.access_token, data, function(user) {
				Server.models.Users.users.update(user.id, user);
				Server.services.Socket.sendSecureSocket('Users.onUsersUpdate', 'admin', user);
				Server.services.Socket.sendSecureSocket('User.onUserUpdate', service.getChannelKey(socket, 'uid'), user);
			}, function(error) {
				Server.services.Socket.sendSecureSocket('User.onFailUserUpdate', socket.id, error.errors);
			});
		});

		service.model.on('uploadPhoto', function(socket, data) {
			Server.services.Api.file('user/photo', socket.access_token, data, function(user) {
				var userPhotos = service.getUserPhotos(user.id);
				userPhotos.add(user.photo);
				Server.models.Users.users.update(user.id, user);
				Server.services.Socket.sendSecureSocket('Users.onUsersUpdate', 'admin', user);
				Server.services.Socket.sendSecureSocket('User.onUserUpdate', service.getChannelKey(socket, 'uid'), user);
				Server.services.Socket.sendSecureSocket('User.onUserUploadPhoto', service.getChannelKey(socket, 'uid'), user.photo);
			}, function(error) {
				Server.services.Socket.sendSecureSocket('User.onFailUserUploadPhoto', socket.id, {title: error.message});
			});
		});

		service.model.on('removePhoto', function(socket, data) {
			Server.services.Api.del('user/photo', socket.access_token, data, function(photo) {
				var userPhotos = service.getUserPhotos(photo.user_id);
				userPhotos.remove(photo.id);
				Server.services.Socket.sendSecureSocket('User.onUserRemovePhoto', service.getChannelKey(socket, 'uid'), photo);
			}, function(error) {
				Server.services.Socket.sendSecureSocket('User.onFailUserRemovePhoto', socket.id, {title: error.message});
			});
		});

		service.model.on('photo', function(socket, data) {
			Server.services.Api.get('user/photo', socket.access_token, data, function(photos, page, limit, total) {
				var userPhotos = service.getUserPhotos(service.getChannelKey(socket, 'uid'));
				userPhotos.set(photos, total);
				Server.services.Socket.sendSecureSocket('User.onUserPhoto', socket.id, {
					list: userPhotos.get(),
					total: total
				});
			}, function(error) {
				Server.services.Socket.sendSecureSocket('User.onFailUserPhoto', socket.id, {title: error.message});
			});
		});

		service.model.on('logout', function(socket) {
			service.logout(socket);
		});

		service.model.on('online', function(socket, data) {
			var uniqueUsers = service.getUniqueOnlineUsers();
			Server.services.Socket.sendSecureSocket('User.onUserOnline', socket.id, {
				list: uniqueUsers,
				total: _.size(uniqueUsers)
			});
		});

		service.getUniqueOnlineUsers = function() {
			var allUsers = service.users.get();
			var uniqueUsers = {};
			_.each(allUsers, function(data) {
				if (_.isEmpty(uniqueUsers[data.id])) {
					uniqueUsers[data.id] = {
						id: data.id,
						full_name: data.full_name,
						photo: data.photo ? data.photo.url : null,
						unique: 0,
						count: 0
					};
				}
				uniqueUsers[data.id].unique++;
				uniqueUsers[data.id].count += data.connections;
			});
			return uniqueUsers;
		};

		service.getProfile = function(socket, access, callback, failCallback) {
            // service.model.view(access, {}, function(profile) {
			Server.services.Api.get('me', access, {}, function(profile) {
				profile.access_token = socket.access_token = access;
				callback(profile);
			}, function(error) {
				if (failCallback) {
					failCallback(error);
				}
			});
		}

		service.logout = function(socket) {
			this.removeConnection(socket, true);
			Server.services.Socket.sendSecureSocket('User.onUserLogout', this.getChannelKey(socket, 'access') || socket.id, {role: 'guest'});
			this.leaveAllChannels(socket);
		};

		/******************************************************************************************************************/
		
		service.getChannelKey = function(socket, channel) {
			return (!_.isEmpty(socket.channels) && !_.isEmpty(socket.channels[channel])) ? socket.channels[channel] : false;
		};

		service.joinChannel = function(socket, channel, key) {
			if (_.isEmpty(socket.channels)) {
				socket.channels = {};
			}
			socket.channels[channel] = key;
			socket.join(key);
		};

		service.leaveChannel = function(socket, channel, key) {
			delete(socket.channels[channel]);
			socket.leave(key);
		};

		service.leaveAllChannels = function(socket) {
			_.each(socket.channels, function(key, channel) {
				service.leaveChannel(socket, channel);
			});
		};

		/******************************************************************************************************************/

		return service;
	}();
};