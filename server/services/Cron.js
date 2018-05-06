module.exports = function(Server, config, _, pr) {

	'use strict';

	return function() {

		var service = {};

		service.init = function() {
			// service.registerCronJobs();
		}

		service.registerCronJobs = function () {
			setInterval(function () {
				// pr(Server.models.Member.getAllMembers());
				// pr(Server.models.Member.getAllMembersSock());
				// pr('users(' + Server.models.Member.getCountMembers() + ')');
			}, 10 * 1000);
		};

		return service;
	}();
};