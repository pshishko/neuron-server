module.exports = function (Server, config, _, dd) {

	'use strict';

	return function () {

		return	{
            EI: null,
            id: null,
            axon: null,
            weight: null,
            sinapses: [],
            outputSinapses: null,
            deviationActivation: null,

            new: function(id, inNeurons) {
                this.id     = id;
                let neuron  = _.clone(this);
                neuron.outputSinapses = [];
                neuron.newSinapses(inNeurons, neuron);
                return neuron;
            },

            newSinapses: function(inNeurons, outNeuron) {
                this.sinapses = _.map(inNeurons, function(inNeuron, key) {
                    let sinaps = Server.neuron.Sinaps.new('(' + inNeuron.id + ')/(' + outNeuron.id + ')' + (key + 1), inNeuron, outNeuron);
                    inNeuron.outputSinapses.push(sinaps);
                    dd(inNeuron.outputSinapses);
                    return sinaps;
                });
            },

            get: function() {
                return {
                    id: this.id,
                    axon: this.axon,
                    weight: this.weight,
                    sinapses: _.map(this.sinapses, sinaps => {
                        return sinaps.get();
                    }),
                    outputSinapses: _.map(this.outputSinapses, sinaps => {
                        return sinaps.get();
                    }),
                    EI: this.EI,
                    deviationActivation: this.deviationActivation,
                };
            },

            calculate: function() {
                this.weight = this.sinapsesWeight();
                this.axon   = this.activation();
                this.deviationActivation = this.deviationActivationFn();
            },

            sinapsesWeight: function() {
                return _.sum(_.map(this.sinapses, function(sinaps) {
                    return sinaps.inSignal();
                }));
            },

            activation: function() {
                return 1 / (1 + Math.exp(-1 * config.neuron.alpha * this.weight));
            },

            deviationActivationFn: function() {
                return config.neuron.alpha * this.axon * (1 - this.axon);
            },

        };

	}();
};
