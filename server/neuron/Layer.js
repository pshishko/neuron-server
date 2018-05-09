module.exports = function (Server, config, _, dd) {

	'use strict';

	return function () {

        return {
            id: null,
            inLayer: {},
            neurons: [],

            new: function(id, inLayer, neuronsCount) {
                this.id      = id;
                this.inLayer = inLayer;
                if (inLayer && inLayer.neurons) {
                    this.newNeurons(neuronsCount, inLayer.neurons);                
                } else if (neuronsCount > 0) {
                    this.newNeurons(neuronsCount);                
                }
                return _.clone(this);
            },

            newNeurons: function(count, inNeurons) {
                this.neurons = _.map(_.range(count), function(v, key) {
                    return Server.neuron.Neuron.new(this.id + '_n' + (key + 1), inNeurons);
                }.bind(this));
            },

            get: function() {
                return {
                    id: this.id,
                    neurons: _.map(this.neurons, neuron => {
                        dd(neuron.get());
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
