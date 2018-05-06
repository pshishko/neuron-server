module.exports = function (Server, config, _, pr) {

	'use strict';

	return function () {

		var service			= {};
        service.alpha       = 1;
        service.EI;

        service.id;
        service.axon;
        service.sinapses = [];

        service.new = function(id, inNeurons) {
            this.id     = id;
            let neuron  = _.clone(this);
            neuron.newSinapses(inNeurons, neuron);
            return neuron;
        }

        service.newSinapses = function(inNeurons, outNeuron) {
            this.sinapses = _.map(inNeurons, function(inNeuron, key) {
                return Server.neuron.Sinaps.new('(' + inNeuron.id + ')/(' + outNeuron.id + ')' + (key + 1), inNeuron, outNeuron);
            });
        }

        service.getSinapsesWeight = function() {
            return _.sum(_.map(this.sinapses, function(sinaps) {
                return sinaps.inSignal();
            }));
        };

        service.activation = function() {
            return 1 / (1 + Math.exp(-1 * this.alpha * this.weight));
        };

		/******************************************************************************************************************/

		return service;
	}();
};
