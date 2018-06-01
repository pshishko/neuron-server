module.exports = function(Server, config, _, dd) {

	'use strict';

	return function() {

		var service = {};
        service.network = {};

		service.init = function(callback) {

            // let network = Server.neuron.Network.new(4, 3, 12);
            service.network = Server.neuron.Network.new(2, 2, 2);
            let data = Server.neuron.NetworkStorage.loadList('list');

            service.network.training(data, () => {
                callback(service.network.getNetworkData());
            });

            Server.neuron.NetworkStorage.storeNetwork('network_2', service.network.getNetworkData());
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
		};

        service.trainingStop = function() {
            service.network.isTraining = false;
        }



        // service.getNetwork = function() {
        //     let networkData = Server.neuron.NetworkStorage.loadNetwork('network_22');
        //     let network2 = Server.neuron.Network.load(networkData);
        // };

		return service;
	}();
};