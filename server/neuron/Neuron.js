module.exports = function (Server, config, _, pr) {

	'use strict';

	return function () {

		return	{
            EI: null,
            id: null,
            axon: null,
            sinapses: [],

            new: function(id, inNeurons) {
                this.id     = id;
                let neuron  = _.clone(this);
                neuron.newSinapses(inNeurons, neuron);
                return neuron;
            },

            newSinapses: function(inNeurons, outNeuron) {
                this.sinapses = _.map(inNeurons, function(inNeuron, key) {
                    return Server.neuron.Sinaps.new('(' + inNeuron.id + ')/(' + outNeuron.id + ')' + (key + 1), inNeuron, outNeuron);
                });
            },

            getSinapsesWeight: function() {
                return _.sum(_.map(this.sinapses, function(sinaps) {
                    return sinaps.inSignal();
                }));
            },

            activation: function() {
                return 1 / (1 + Math.exp(-1 * config.neuron.alpha * this.weight));
            },
        };

	}();
};
