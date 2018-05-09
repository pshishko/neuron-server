module.exports = function(Server, config, _, dd) {

	'use strict';

	return function() {

		var service = {};

		service.init = function() {

            let network = Server.neuron.Network.init(2, 2, 2);
            let data = Server.neuron.NetworkGenerator.getBalancedData([0.50, 0.50], 2);

            Server.neuron.NetworkStorage.storeList('list', data);
            Server.neuron.NetworkStorage.storeNetwork('network_init', network.getNetworkData());

//             network.training(data);
setTimeout(() => {
    dd(Server.neuron.NetworkStorage.loadNetwork('network_init'),1);

}, 1000);
//             Server.neuron.NetworkStorage.storeNetwork('network_2', network.getNetworkData());
// dd(Server.neuron.NetworkStorage.loadNetwork('network_2'),1);
            // console.table(network.test(data));

            // data = Server.neuron.NetworkGenerator.getBalancedData([0.33, 0.33, 0.34], 3);
            // console.table(network.test(data));


            // pr(123, 1);

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