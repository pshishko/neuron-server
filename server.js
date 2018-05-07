(function() {

	'use strict';

	var config = require('./server/configs/local');
    const cTable = require('console.table');

	var colors = require('colors');
	var pr = (config.consoleLog !== 0) ? require('./server/components/pr') : function() {};
	var _ = require('lodash');

	var Server = Server || {};
	var al = require('./server/components/autoLoader')(Server, config, _, pr);

	Server.services = al.loadDirModules(__dirname + '/server', 'services');

	al.loadDirModules(__dirname + '/server', 'models/base', function(moduleName, module) {
		Server.models = Server.services.Helper.addToObject(Server.models, moduleName, module);
	});
	// al.loadDirModules(__dirname + '/server', 'models/admin', function(moduleName, module) {
	// 	Server.models = Server.services.Helper.addToObject(Server.models, moduleName, module);
	// });
	al.loadDirModules(__dirname + '/server', 'models', function(moduleName, module) {
		Server.models = Server.services.Helper.addToObject(Server.models, moduleName, module);
	});

    al.loadDirModules(__dirname + '/server', 'neuron', function(moduleName, module) {
        Server.neuron = Server.services.Helper.addToObject(Server.neuron, moduleName, module);
    });

	Server.App = require('./server/app')(Server, config, _, pr);
	Server.App.init();
})();