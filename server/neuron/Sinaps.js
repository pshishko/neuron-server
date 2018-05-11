module.exports = function (Server, config, _, dd) {

	'use strict';

	return function () {

		return {
            id: null,
            inNeuron: {},
            outNeuron: {},
            weight: null,

            globalSinapses: {},

            new: function(id, inNeuron, outNeuron) {
                let sinaps = _.clone(this);
                sinaps.id = id;
                sinaps.inNeuron    = inNeuron;
                sinaps.outNeuron   = outNeuron;

                let range = (1 / 9) * 1000;
                sinaps.weight = _.random(-1 * range, range) / 1000;
                
                this.globalSinapses[sinaps.id] = sinaps;
                return sinaps;
            },

            get: function() {
                return {
                    id: this.id,
                    inNeuronId: this.inNeuron.id,
                    outNeuronId: this.outNeuron.id,
                    weight: this.weight
                };
            },

            load: function(sinaps, inNeuron, outNeuron) {
                // dd(sinaps);
                let newSinaps = _.clone(this);
                newSinaps.id  = sinaps.id;
                newSinaps.inNeuron  = inNeuron;
                newSinaps.outNeuron = outNeuron;
                newSinaps.weight = sinaps.weight;
// dd(newSinaps,1);
                this.globalSinapses[newSinaps.id] = newSinaps;
                return newSinaps;
            },

            inSignal: function () {
                return this.weight * this.inNeuron.axon;
            }
        };
	}();
};
