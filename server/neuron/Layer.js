module.exports = function (Server, config, _, dd) {

	'use strict';

	return function () {

        return {
            id: null,
            inLayer: {},
            neurons: [],

            new: function(id, inLayer) {
                this.id      = id;
                this.inLayer = inLayer;
                return _.clone(this);
            },

            newNeurons: function(count, inNeurons) {
                this.neurons = _.map(_.range(count), function(v, key) {
                    let neuron = Server.neuron.Neuron.new(this.id + '_n' + (key + 1));
                    neuron.newSinapses(inNeurons);
                    return neuron;
                }.bind(this));
            },

            load: (layer, inLayer) => {
// dd(layer);
                let newLayer = Server.neuron.Layer.new(layer.id, inLayer);
                newLayer.neurons = _.map(layer.neurons, neuron => {                    
                    let newNeuron = Server.neuron.Neuron.load(neuron);
                    if (inLayer && inLayer.neurons) {

                        newNeuron.loadSinapses(neuron.sinapses, inLayer.neurons);
                        // newNeuron.newSinapses(neuron.sinapses, inLayer.neurons);
                    } else {
                        // dd(neuron.outputSinapses);
                        // newNeuron.outputSinapses = _.map(neuron.outputSinapses, sinaps => {
                        //     return Server.neuron.Sinaps.globalSinapses[sinaps.id];
                        // });
                        // dd(newNeuron);
                        // dd(neuron, 1);
                    }
                    // dd(neuron.sinapses);
                    return newNeuron;
                })
                // dd(newLayer);
                return newLayer;
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
