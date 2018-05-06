module.exports = function (Server, config, _, pr) {

	'use strict';

	return function () {

		var service = {};

		var fs = require('fs');
		var path = require('path');

		service.loadDirModules = function (dirPath, dirName, callback) {
			var modulesPath = require('path').join(dirPath, dirName);
			var modules = modules || {};
			_.each(fs.readdirSync(modulesPath), function (file) {
				var moduleName = file.substr(0, file.indexOf('.'));
				var modulePath = path.join(modulesPath, file);

				if (fs.statSync(modulePath).isFile()) {
					modules[moduleName] = require(modulePath)(Server, config, _, pr); 
					if (callback) {
						callback(moduleName, modules[moduleName]);
					}
				}
			});
			return modules;
		};

		/******************************************************************************************************************/

		return service;
	}();
};