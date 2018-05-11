module.exports = function (Server, config, _, dd) {

	'use strict';

	return function () {

        return {
            layers: [],
            inLayers: [],
            hdLayers: [],
            outLayers: [],

            new: function(signalsCount, hdLayersCount, hdNeuronsCount) {
                this.inLayers = this.newLayers('in', 1, signalsCount, null);
                this.hdLayers = this.newLayers('hd', hdLayersCount, hdNeuronsCount, this.inLayers[0]);
                this.outLayers = this.newLayers('out', 1, 1, this.hdLayers[hdLayersCount - 1]);
                this.layers = _.union(this.inLayers, this.hdLayers, this.outLayers);
                return _.clone(this);
            },

            newLayers: function(prefix, layersCount, neuronsCount, inLayer) {
                var layer = inLayer || null;
                return _.map(_.range(layersCount), function(v, key) {
                    layer = Server.neuron.Layer.new(prefix + (key + 1), layer);

                    if (inLayer && inLayer.neurons) {
                        layer.newNeurons(neuronsCount, inLayer.neurons);                
                    } else if (neuronsCount > 0) {
                        layer.newNeurons(neuronsCount);                
                    }

                    return layer;
                });
            },

            getNetworkData: function() {
                return _.chain(this.layers)
                    .map(layer => {
                        return layer.get();
                    }).value();
            },

            load: function(networkData) {
                let network = _.clone(this);
                let inLayer = null;

                network.layers = _.map(networkData, layer => {
                    inLayer = Server.neuron.Layer.load(layer, inLayer);
                    return inLayer;
                });

                // dd(_.map(network.layers, layer => {
                //     dd(_.map(layer.neurons, neuron => {
                //         dd(neuron.sinapses);
                //     }));
                // }),1);
                return network;
            },

            forecast: function(data) {
                _.each(this.layers[0].neurons, function(neuron, key) {
                    neuron.axon = data[key];
                });
                _.each(_.slice(this.layers, 1), function(layer) {
                    layer.calculate();
                });

                return this.getOutputNeuron().axon;
            },

            learn: function(data, result) {
                this.forecast(data);

                this.calcGradientError(result);
                this.gradient();

                let deviation = Math.abs(this.getOutputNeuron().axon - result);

                return deviation;
            },

            training: function(list) {
                let epoch = 0;
                let avgDeviation = 1;
                let maxDeviation = 1;

                while (epoch < 20000 && (avgDeviation >= 0.08 || maxDeviation >= 0.08 || epoch <= 100)) {
                    epoch++;

                    let deviations = [];
                    _.each(_.slice(list, 0, -1), (row) => {
                        deviations.push(this.learn(row, _.last(row)));
                    });
                    avgDeviation = _.sum(deviations) / deviations.length;
                    maxDeviation =  _.max(deviations);
                    if (epoch % 100 === 0) {
                        dd('On epoch ' + epoch + ' max ' + maxDeviation + ' avg ' + avgDeviation);
                    }
                }

                return epoch;
            },

            test: function(list) {
                return _.map(list, (row) => {
                    let signals         = _.slice(row, 0, -1);
                    let result          = row[signals.length];
                    let approximation   = this.forecast(signals);
// pr(signals);
// pr(result);
// pr(approximation, 1);
                    // row.push(Math.round(this.forecast(signals), -2))
                    signals.push(result);
                    signals.push(this.round(result));
                    signals.push(approximation);
                    signals.push(this.round(approximation));
                    signals.push(this.round(Math.abs(result - approximation)));
                    return signals;
                }).sort((a, b) => a[0] < b[0]);
            },
        
    /******************************************************************************************************************/
            round: function(float) {
                return Math.round(float * 100) / 100;
            },

            getOutputNeuron: function() {
                return _.first(_.last(this.layers).neurons);
            },

            calcGradientError: function(result) {
                let outputNeuron       = this.getOutputNeuron();

                outputNeuron.EI   = (result - outputNeuron.axon) * outputNeuron.deviationActivation;

                _.each(_.reverse(_.slice(this.layers, 1, this.layers.length - 1)), (layer) => {
                    _.each(layer.neurons, (neuron) => {
                        let sum = _.chain(neuron.outputSinapses)
                                .map(sinaps => {
                                    return sinaps.outNeuron.EI * sinaps.weight;
                                })
                                .sum()
                                .value();

                        neuron.EI = sum * neuron.deviationActivation;
                    });
                });
            },

            gradient: function(result) {
                _.each(this.layers, (layer) => {
                    _.each(layer.neurons, (neuron) => {
                        _.each(neuron.sinapses, (sinaps) => {
                            sinaps.weight += config.neuron.learn_step_k * sinaps.inNeuron.axon * sinaps.outNeuron.EI;
                        });
                    });
                });
            },

        };
	}();
};
