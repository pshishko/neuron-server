module.exports = function (Server, config, _, dd) {

	'use strict';

	return function () {

        var fs = require('fs');

		return {
            storeNetwork: function(name, network) {
                this.storeFile(name, JSON.stringify(network));
            },

            storeList: function(name, list) {
                this.storeFile(name, this.joinList(list));
            },

            loadNetwork: function(name) {
                return JSON.parse(this.loadFile(name));
            },

            loadList: function(name) {
                return this.splitList(this.loadFile(name));
            },

            storeFile: (name, content) => {
                fs.writeFile('./server/tmp/'+ name +'.tst', content, function (err) {
                    if (err) throw err;
                    dd('List stored successful path: ./server/tmp/'+ name +'.tst');
                });
            },

            loadFile: (name) => {
                return fs.readFileSync('./server/tmp/'+ name +'.tst', 'utf8');/*, content, function (err) {
                    if (err) throw err;
                    dd('List stored successful path: ./server/tmp/'+ name +'.tst');
                });*/
            },

            joinList: list => {
                return _.chain(list)
                    .sortBy(list.length)
                    .map((row) => {
                        return row.join(' ');
                    })
                    .value()
                    .join('\n');
            },

            splitList: content => {
                return _.filter(_.map(content.split('\n'), row => {
                    return row.split(' ');
                }), row => row.length > 1);
            },
        };
	}();
};
