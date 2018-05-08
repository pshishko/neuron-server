module.exports = function(Server, config, _, pr) {

	'use strict';

	return function() {

		var service = {};

		service.init = function() {

            let network = Server.neuron.Network.init(3, 5, 9);
            let data = Server.neuron.NetworkGenerator.getBalancedData([0.33, 0.33, 0.34], 2);
            pr(network.training(data));
            console.table(network.test(data));

            data = Server.neuron.NetworkGenerator.getBalancedData([0.33, 0.33, 0.34], 3);
            console.table(network.test(data));


            pr(123, 1);

            // pr(network.getNetwork());
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