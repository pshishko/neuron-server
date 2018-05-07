module.exports = function (Server, config, _, pr) {

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
                this.weight      = (Math.random() * 3) - 1.5;

                return _.clone(this);
            },

            inSignal: function () {
                return this.weight * this.inNeuron.axon;
            }
        };
	}();
};
