module.exports = function(Server, config, _, pr) {

	'use strict';

	return function() {

		var service = {};

		service.init = function() {
			// service.registerCronJobs();

            let network = Server.neuron.Network.init(2, 2, 2);
            // pr(network.getNetwork(), 1);


            pr(network.getNetwork());
            pr(network.forecast([1, 1]));
            pr(network.forecast([1, 0]));
            pr(network.learn([1, 1], 1));
            pr(network.forecast([1, 1]));
            pr(network.learn([0, 1], 0));
            pr(network.forecast([0, 0]));
            pr(network.forecast([0, 1]));
            pr(network.training([
                [1, 1, 1],
                [1, 0, 1],
                [0, 1, 0],
                [0, 0, 0],
            ]));

            pr(network.forecast([0, 0]));
            pr(network.forecast([0, 1]));
            pr(123,1);
		}

		// service.registerCronJobs = function () {
		// 	setInterval(function () {
		// 		// pr(Server.models.Member.getAllMembers());
		// 		// pr(Server.models.Member.getAllMembersSock());
		// 		// pr('users(' + Server.models.Member.getCountMembers() + ')');
		// 	}, 10 * 1000);
		// };

		return service;
	}();
};