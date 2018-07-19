module.exports = function(Server, config, _, pr) {

	'use strict';

	return function() {

		var service			= {};

		service.model		= Server.models.Model.instance('Neuron', {
            socket: 'neuron',
        });
        service.model.initAction(null, 'getStored');
        service.model.initAction(null, 'training');
        service.model.initAction(null, 'trainingStop');

		/******************************************************************************************************************/

        service.model.on('getStored', function(socket) {
            let networkData = Server.neuron.NetworkStorage.loadNetwork('network_2');
            Server.services.Socket.sendSecureSocket('Neuron.onNeuronGetStored', socket.id, networkData);
        });

        service.model.on('training', function(socket) {
            Server.services.Neuron.init((networkData) => {
                Server.services.Socket.sendSecureSocket('Neuron.onNeuronTraining', socket.id, networkData);
            });
        });

        service.model.on('trainingStop', function(socket) {
            Server.services.Neuron.trainingStop();
            Server.services.Socket.sendSecureSocket('Neuron.onNeuronTrainingStop', socket.id, true);
		});

		/******************************************************************************************************************/

		return service;
	}();
};