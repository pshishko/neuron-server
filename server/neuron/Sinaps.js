module.exports = function (Server, config, _, dd) {

	'use strict';

	return function () {

		return {
            id: null,
            inNeuron: {},
            outNeuron: {},
            weight: null,

            new: function(id, inNeuron, outNeuron) {
                this.id = id;
                this.inNeuron    = inNeuron;
                this.outNeuron   = outNeuron;

                let range = (1 / 9) * 1000;
                this.weight = _.random(-1 * range, range) / 1000;

                return _.clone(this);
            },

            get: function() {
                return {
                    id: this.id,
                    wight: this.weight
                };
            },

            inSignal: function () {
                return this.weight * this.inNeuron.axon;
            }
        };
	}();
};
