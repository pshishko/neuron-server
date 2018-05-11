module.exports = function(Server, config, _, dd) {

	'use strict';

	return function() {

		var service = {};

		service.init = function() {

            let network = Server.neuron.Network.new(2, 2, 2);
            let data = Server.neuron.NetworkGenerator.getBalancedData([0.50, 0.50], 2);

            Server.neuron.NetworkStorage.storeList('list', data);
            Server.neuron.NetworkStorage.storeNetwork('network_init', network.getNetworkData());

            network.training(data);
            Server.neuron.NetworkStorage.storeNetwork('network_2', network.getNetworkData());
            console.table(network.test(data));

setTimeout(() => {
    // console.table(network.test(data));
    // let networkData2 = Server.neuron.NetworkStorage.loadNetwork('network_init');
    // dd(networkData2);
    // let network2 = Server.neuron.Network.load(networkData2);
    let networkData = Server.neuron.NetworkStorage.loadNetwork('network_2');
    let network2 = Server.neuron.Network.load(networkData);
    Server.neuron.NetworkStorage.storeNetwork('network_22', network2.getNetworkData());

    console.table(network2.test(data));
    // dd(network2.getNetworkData(),1);
                // network2.training(data);
    // console.table(network2.test(networkData));


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