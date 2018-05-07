module.exports = function (Server, config, _, pr) {

	'use strict';

	return function () {

        return {
            layers: [],
            inLayers: [],
            hdLayers: [],
            outLayers: [],

            init: function(signalsCount, hdLayersCount, hdNeuronsCount) {
                this.inLayers = this.newLayers('in_', 1, signalsCount, null);
                this.hdLayers = this.newLayers('hd_', hdLayersCount, hdNeuronsCount, this.inLayers[0]);
                this.outLayers = this.newLayers('out_', 1, 1, this.hdLayers[hdLayersCount - 1]);
                this.layers = _.union(this.inLayers, this.hdLayers, this.outLayers);
                return _.clone(this);
            },

            newLayers: function(prefix, layersCount, neuronsCount, inLayer) {
                var layer = inLayer || null;
                return _.map(_.range(layersCount), function(v, key) {
                    layer = Server.neuron.Layer.new(prefix + (key + 1), layer, neuronsCount);
                    return layer;
                });
            },

            getNetwork: function() {
                return _.map(this.layers, function(layer) {
                    return {
                        'id': layer.id,
                        'neurons_count': layer.getNeurons().length,
                        'sinapses_count': layer.getSinapses().length,
                    };
                });
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
                let currDeviation = 1;
                let maxDeviation = 1;

                while (epoch < 100000 && (/*currDeviation >= 0.03 || */maxDeviation >= 0.03 || epoch <= 100)) {
                    epoch++;

                    let deviations = [];
                    _.each(_.slice(list, 0, -1), (row) => {
                        deviations.push(this.learn(row, _.last(row)));
                    });
                    currDeviation = _.sum(deviations) / deviations.length;
                    maxDeviation =  _.max(deviations);
                    if (epoch % 100 === 0) {
                        pr('On epoch ' + epoch + ' max deviation is ' + currDeviation);
                    }
                }

                return epoch;
            },

            test: function(list) {
                return _.map(list, (row) => {
                    let signals         = _.slice(row, 0, -1);
                    let result          = row[signals.length];
                    let approximation   = this.forecast(signals);

                    // row.push(Math.round(this.forecast(signals), -2))
                    signals.push(this.round(result))
                    signals.push(this.round(approximation))
                    signals.push(this.round(Math.abs(result - approximation)))
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

                outputNeuron.EI   = (outputNeuron.axon - result) * outputNeuron.axon * (1 - outputNeuron.axon);

                _.each(_.reverse(_.slice(this.layers, 1)), (layer) => {
                    _.each(layer.neurons, (neuron) => {
                        _.each(neuron.sinapses, (sinaps) => {
                            sinaps.inNeuron.EI = neuron.EI * sinaps.inNeuron.axon * (1 - sinaps.inNeuron.axon) * sinaps.weight;
                        });
                    });
                });
            },

            gradient: function(result) {
                _.each(this.layers, (layer) => {
                    _.each(layer.neurons, (neuron) => {
                        _.each(neuron.sinapses, (sinaps) => {
                            sinaps.weight = sinaps.weight - config.neuron.learn_step_k * sinaps.inNeuron.axon * sinaps.outNeuron.EI;
                        });
                    });
                });
            },
        };
	}();
};
