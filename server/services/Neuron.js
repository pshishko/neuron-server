module.exports = function(Server, config, _, dd) {

	'use strict';

	return function() {

		var service = {};

		service.init = function() {

            let network = Server.neuron.Network.new(4, 3, 12);
            let data = Server.neuron.NetworkStorage.loadList('list');
// dd(data,1);
            network.training(data);

            Server.neuron.NetworkStorage.storeNetwork('network_2', network.getNetworkData());
            // console.table(network.test(data, true).sort((a, b) => b[6] - a[6]));
            // Server.neuron.NetworkStorage.storeList('list', data);
            // Server.neuron.NetworkStorage.storeNetwork('network_init', network.getNetworkData());

            setTimeout(() => {
                let set1 = Server.neuron.NetworkGenerator.getBalancedData(2, 3);

                set1 = _.filter(set1, function(signals) {
                    return signals[1] != 0.5;
                });

                let set2 = Server.neuron.NetworkGenerator.getBalancedData(2, 12);
                let data = Server.neuron.NetworkGenerator.combineSets(set1, set2);

                let networkData = Server.neuron.NetworkStorage.loadNetwork('network_2');
                let network2 = Server.neuron.Network.load(networkData);

                // console.table(network2.test(data));
                // network2.training(data);
                console.table(network2.test(data));


            }, 1000);
		}

		return service;
	}();
};