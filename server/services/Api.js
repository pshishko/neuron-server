module.exports = function(Server, config, _, pr) {

	'use strict';

	return function() {
		
		var service = {};

		var restler = require('restler');

		service.auth = function (action, data, callback, failCallback) {
			pr('auth - ' + action);
			var headers = {
				'Content-Type'    : 'application/x-www-form-urlencoded',
				'X-Requested-With': 'XMLHttpRequest'
			};
			data = _.defaults(data, {
				grant_type		: 'client_credentials',
				client_id		: config.auth.client_id,
				client_secret	: config.auth.client_secret,
			});
			restler.post(config.apiUrl + '/' + action, {
				data   : data,
				headers: headers,
			}).on('success',function (data, response) {
				pr('success - auth ' + action);
				callback(data.access_token);
			}).on('fail', function (data, response) {
				pr('fail - auth ' + action);
				failCallback(data)
			});
			return true;
		};

		service.get = function (action, access, data, callback, failCallback) {
			var headers = {
				'Content-Type'    : 'application/x-www-form-urlencoded',
				'X-Requested-With': 'XMLHttpRequest'
			};

			if (data.id) {
				action += '/' + data.id;
			} else {
				// data['per-page'] = data['per-page'] ? data['per-page'] : 'all';
			}

			pr('get /' + action);
pr(config.apiUrl + '/' + action);
pr(data);
			restler.get(config.apiUrl + '/' + action, {
				query   : data,
				headers: headers,
				accessToken: access,
			}).on('success',function (data, response) {
				pr('success - /' + action);
				service.returnValidCallback(data, callback);
			}).on('fail', function (data, response) {
				pr('fail - /' + action);
				pr(data);
				pr(response.statusMessage);
				failCallback(data)
			});
			return true;
		};

		service.post = function (action, access, data, callback, failCallback) {
			pr('post /' + action);
			pr(data);
			var headers = {
				'Content-Type'    : 'application/x-www-form-urlencoded',
				'X-Requested-With': 'XMLHttpRequest'
			};
			restler.post(config.apiUrl + '/' + action, {
				data   : data,
				headers: headers,
				accessToken: access,
			}).on('success',function (data, response) {
				pr('success - /' + action);
				service.returnValidCallback(data, callback);
			}).on('fail', function (data, response) {
				pr('fail - /' + action);
				pr(data);
				failCallback(data)
			});
			return true;
		};

		service.put = function (action, access, data, callback, failCallback) {
			pr('put /' + action);

			var headers = {
				'Content-Type'    : 'application/x-www-form-urlencoded',
				'X-Requested-With': 'XMLHttpRequest'
			};
			
			if (data.id) {
				action += '/' + data.id;
				delete(data.id);
			}
			
			restler.put(config.apiUrl + '/' + action, {
				data   : data,
				headers: headers,
				accessToken: access,
			}).on('success',function (data, response) {
				pr('success - ' + action);
				service.returnValidCallback(data, callback);
			}).on('fail', function (data, response) {
				pr('fail - ' + action);
				pr(data);
				failCallback(data)
			});
			return true;
		};

		service.file = function (action, access, data, callback, failCallback) {
			pr('put /' + action);

			var headers = {
				// 'Content-Type'    : 'multipart/form-data; charset=UTF-8',
				// 'Content-Type'    : 'application/json; charset=UTF-8',
				'Content-Type'    : 'application/x-www-form-urlencoded',
				'X-Requested-With': 'XMLHttpRequest'
			};

			restler.post(config.apiUrl + '/' + action, {
				data: data,
				// multipart: true,
				// data: {
				// 	'crop-image': restler.data('crop-image', 'multipart/form-data', data, 'image/jpeg')
				// },
				headers: headers,
				accessToken: access,
			}).on('success',function (data, response) {
				pr('success - ' + action);
				pr(data);
				service.returnValidCallback(data, callback);
			}).on('fail', function (data, response) {
				pr('fail - ' + action);
				failCallback(data)
			});
			return true;
		};

		service.del = function (action, access, data, callback, failCallback) {
			pr('del /' + action);
			pr(data);
			var headers = {
				'Content-Type'    : 'application/x-www-form-urlencoded',
				'X-Requested-With': 'XMLHttpRequest'
			};

			if (data.id) {
				action += '/' + data.id;
				delete(data.id);
			}

			restler.del(config.apiUrl + '/' + action, {
				data   : {},
				headers: headers,
				accessToken: access,
			}).on('success',function (data, response) {
				pr('success - ' + action);
				service.returnValidCallback(data, callback);
			}).on('fail', function (data, response) {
				pr('fail - ' + action); 
				pr(data);
				failCallback(data)
			});
			return true;
		};

		service.returnValidCallback = function(data, callback) { pr(data);
			if (data.status_code == 200 || data.status_code == 201) {
                var model = data.items ? data.items : data.model;
				if (!_.isEmpty(data._links)) {
					callback(model, data._links.currentPage, data._links.perPage, data._links.totalCount);
				} else {
					callback(model);
				}
			} else {
				pr(data);
			}
		}

		return service;
	}();
};