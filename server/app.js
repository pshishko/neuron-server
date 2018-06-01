module.exports = function (Server, config, _, pr) {

	'use strict';

	return function () {

		var init = function () {
			Server.services.Socket.init();
			Server.services.Cron.init();
            // Server.services.Neuron.init();
		};

		return {
			init: init
		};
	}();
};