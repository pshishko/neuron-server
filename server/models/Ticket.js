module.exports = function(Server, config, _, pr) {

	'use strict';

	return function() {

		var service			= {};

		service.model		= Server.models.Model.instance('Ticket', {
            socket: 'ticket',
            apiAction: 'tickets'
        });
        service.model.initAction(null, 'open');
        service.model.initAction(null, 'openAll');

        service.users           = service.model.observe();
        service.userTickets     = service.model.observe();
        service.tickets         = service.model.observe();

        service.getTicketUsers = function(ticket_id) {
            if (!service.users[ticket_id]) {
                service.users[ticket_id] = service.model.observe();
            }
            return service.users[ticket_id];
        };

        service.getUserTickets = function(user_id) {
            if (!service.userTickets[user_id]) {
                service.userTickets[user_id] = service.model.observe();
            }
            return service.userTickets[user_id];
        };
		/******************************************************************************************************************/

		// service.model.on('view', function(socket, data) {
		// 	service.model.view(socket.access_token, data, function(theme) {
		// 		Server.services.Socket.sendSecureSocket('Theme.onThemeView', socket.id, theme);
		// 	}, function(error) {
		// 		Server.services.Socket.sendSecureSocket('Theme.onFailThemeView', socket.id, error);
		// 	});
		// });

        service.model.on('all', function(socket, data) {
            service.model.all(socket.access_token, data, function(tickets, page, limit, total) {
                service.tickets.set(tickets, total);
                Server.services.Socket.sendSecureSocket('Ticket.onTicketAll', socket.id, {
                    list: service.tickets.get(),
                    total: total
                });
            });
        });

        service.model.on('open', function(socket, ticket_id) {
            var ticket = service.tickets.view(ticket_id);
            service.getTicketUsers(ticket_id).add(ticket);
            service.getUserTickets(socket.channels.uid).add(ticket);
            Server.services.Socket.sendSecureSocket('Ticket.onTicketOpen', socket.channels.uid, ticket);
        });

        service.model.on('openAll', function(socket) {
            var userTickets = service.getUserTickets(socket.channels.uid).get();
            Server.services.Socket.sendSecureSocket('Ticket.onTicketOpenAll', socket.channels.uid, userTickets);
		});
/*
		service.model.on('add', function(socket, data) {
			service.model.add(socket.access_token, data, function(theme) {
				Server.models.User.eachWithAccess(theme.room.access, true, function(role) {
					Server.services.Socket.sendSecureSocket('Theme.onThemeAdd', role, theme);
				});
			});
		});

		service.model.on('update', function(socket, data) {
			service.model.update(socket.access_token, data, function(theme) {
				Server.models.User.eachWithAccess(theme.room.access, true, function(role) {
					Server.services.Socket.sendSecureSocket('Theme.onThemeUpdate', role, theme);
				});
			}, function(error) {
				Server.services.Socket.sendSecureSocket('Theme.onFailThemeUpdate', socket.id, {title: error.message});
			});
		});

		service.model.on('remove', function(socket, data) {
			service.model.remove(socket.access_token, data, function(theme) {
				Server.models.User.eachWithAccess(theme.room.access, true, function(role) {
					Server.services.Socket.sendSecureSocket('Theme.onThemeRemove', role, theme);
				});
			});
		});
        */

		/******************************************************************************************************************/

		return service;
	}();
};