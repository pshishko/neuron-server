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

            globalNeurons: {},

            new: function(id) {
                let neuron  = _.clone(this);
                neuron.id   = id;
                neuron.outputSinapses = [];

                this.globalNeurons[neuron.id] = neuron;
                return neuron;
            },

            newSinapses: function(inNeurons) {
                this.sinapses = _.map(inNeurons, (inNeuron, key) => {
                    let sinaps = Server.neuron.Sinaps.new(inNeuron.id + '/' + this.id + '/s' + (key + 1), inNeuron, this);
                    inNeuron.outputSinapses.push(sinaps);
                    return sinaps;
                });
            },

            load: function(neuron) {
                let newNeuron = this.new(neuron.id);
                return newNeuron;
            },

            loadSinapses: function(sinapses, inNeurons) {
                this.sinapses = _.map(inNeurons, (inNeuron, key) => {
                    let sinaps = Server.neuron.Sinaps.load(sinapses[key], inNeuron, this);
                    inNeuron.outputSinapses.push(sinaps);
                    return sinaps;
                });
            },

            get: function() {
                return {
                    id: this.id,
                    sinapses: _.map(this.sinapses, sinaps => {
                        return sinaps.get();
                    }),
                    outputSinapses: _.map(this.outputSinapses, sinaps => {
                        return sinaps.get();
                    })
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
