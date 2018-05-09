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
                // this.weight      = (Math.random() * 3) - 1.5;
// dd(this.weight);
                // let range = 1 / 3 * (1 / 5 + 1) * 1000;
                this.weight = (Math.random() - 0.5) * 2;
// dd(this.weight);
// dd(range, 1);
                // this->weight           = rand(-1 * $range, $range) / 1000;


                return _.clone(this);
            },

            get: function() {
                return {
                    id: this.id,
                    // inNeuron: this.inNeuron.get('id'),
                    // outNeuron: this.outNeuoron.get('id'),
                    wight: this.weight
                };
            },

            inSignal: function () {
                return this.weight * this.inNeuron.axon;
            }
        };
	}();
};
