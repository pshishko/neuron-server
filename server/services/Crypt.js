module.exports = function(Server, config, _, pr) {

	'use strict';

	return function() {

		var service = {};

		var crypto = require('crypto');

		service.hash = function(text) {
			var hash = crypto.createHmac('sha1', config.cryptKey).update(text).digest('hex');
			return hash;
		}

		service.getKey = function() {
			var currentDate = (new Date()).valueOf().toString();
			var random = Math.random().toString();
			return service.hash(currentDate + random);
		};

		return service;
	}();
};