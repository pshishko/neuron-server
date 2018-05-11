module.exports = function (Server, config, _, dd) {

	'use strict';

	return function () {

        return {
            id: null,
            inLayer: {},
            neurons: [],

            new: function(id, inLayer) {
                let layer       = _.clone(this);
                layer.id        = id;
                layer.inLayer   = inLayer;
                return layer;
            },

            newNeurons: function(count, inNeurons) {
                this.neurons = _.map(_.range(count), function(v, key) {
                    let neuron = Server.neuron.Neuron.new(this.id + '_n' + (key + 1));
                    neuron.newSinapses(inNeurons);
                    return neuron;
                }.bind(this));
            },

            loadNeurons: function(neurons, inNeurons) {
                this.neurons = _.map(neurons, neuron => {
                    let newNeuron = Server.neuron.Neuron.load(neuron);
                    if (inNeurons) {
                        newNeuron.loadSinapses(neuron.sinapses, inNeurons);
                    }
                    return newNeuron;
                });
            },

            get: function() {
                return {
                    id: this.id,
                    neurons: _.map(this.neurons, neuron => {
                        return neuron.get();
                    })
                }
            },

            getNeurons: function() {
                return _.map(this.neurons, function(neuron) {
                    return neuron.id + ' / ' + neuron.axon;
                });
            },

            getSinapses: function() {
                pr(this.id);
                return _.map(this.neurons, function(neuron) {
                    pr(neuron.sinapses.length);
                    return _.map(neuron.sinapses, function(sinaps) {
                        return sinaps.id + ' / ' + sinaps.weight;
                    });
                });
            },

            calculate: function() {
                _.each(this.neurons, function(neuron) {
                    neuron.calculate();
                });
            },
        };

		/******************************************************************************************************************/
	}();
};
