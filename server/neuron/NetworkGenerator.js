module.exports = function (Server, config, _, pr) {

	'use strict';

	return function () {
        return {
            getBalancedData: function(signalsWeight, gradient) {
                return _.map(this.getData(signalsWeight.length, gradient), (row) => {
                    return _.concat(row, _.sum(_.map(row, (col, key) => {
                        return signalsWeight[key] * col;
                    })));
                }).sort((a, b) => a[3] < b[3]);
            },

            getData: function(signalsCount, gradient) {
                if (signalsCount <= 1) {
                    return this.gradientRange(gradient);
                }

                return _.merge(_.flatten(_.map(this.gradientRange(gradient), (key) => {
                    return _.map(this.getData(signalsCount - 1, gradient), (g) => {
                        return _.concat(key, g);
                    });
                })));
            },

            gradientRange: function(gradient) {
                return _.reverse(_.range(0, gradient / (gradient - 1), 1 / (gradient - 1)));
            }
        };
	}();
};
