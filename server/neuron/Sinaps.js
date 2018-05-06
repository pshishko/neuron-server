module.exports = function (Server, config, _, pr) {

	'use strict';

	return function () {

		var service			= {};

        service.id;
        service.inNeuron = {};
        service.outNeuron = {};
        service.weight;

        service.new = function(id, inNeuron, outNeuron) {
            service.id = id;
            service.inNeuron    = inNeuron;
            service.outNeuron   = outNeuron;
            service.weight      = (Math.random() * 3) - 1.5;

            return _.clone(service);
        }

        service.inSignal = function() {
            return this.weight * this.inNeuron.axon;
        }

		/******************************************************************************************************************/

		return service;
	}();
};
