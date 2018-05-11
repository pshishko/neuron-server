module.exports = function (Server, config, _, dd) {

	'use strict';

	return function () {
        return {
            getBalancedData: function(signalsCount, gradient) {

                return this.getData(signalsCount, gradient);


                return _.sortBy(_.map(this.getData(signalsCount, gradient), (row) => {
                    // return _.concat(row, this.round(_.sum(_.map(row, (col, key) => {
                    //     return signalsWeight[key] * col;
                    // }))));
                }), -signalsCount);
            },

            combineSets: (set1, set2) => {
                return _.flatten(_.map(set2, row2 => {
                    return _.map(set1, row1 => {
                        return _.concat(row1, row2);
                    });
                }), 1);
            },

            getData: function(signalsCount, gradient) {
                if (signalsCount <= 1) {
                    return this.gradientRange(gradient);
                }

                return _.merge(_.flatten(_.map(this.gradientRange(gradient), (key) => {
                    return _.map(this.getData(signalsCount - 1, gradient), (g) => {
                        return _.concat(this.round(key), this.round(g));
                    });
                })));
            },

            gradientRange: function(gradient) {
                let gradientValue = Math.ceil(10 * (1 / (gradient - 1))) / 10;
                return _.reverse(_.map(_.range(0, 1.01, gradientValue)), val => {
                    return this.round(val);
                });
            },

            round: function(float) {
                return Math.round(float * 100) / 100;
            },
        };
	}();
};
