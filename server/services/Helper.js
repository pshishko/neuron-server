module.exports = function(Server, config, _, pr) {

	'use strict';

	return function() {

		var service = {};

		service.addToObject = function(object, key, field) {
			object = object || {};
			object[key] = field;
			return object;
		};

		service.searchInObject = function(object, condition) {
			var newObject = {};
			_.map(_.where(object, condition), function(data) {
				newObject[data.id] = data;
			});
			return newObject;
		}

		service.setObjectList = function(object, objectList) {
			object = object || {};
			_.mapObject(objectList, function(newObject, key) {
				object[newObject.id] = newObject;
				return true;
			});
			return object;
		};

		service.updateObject = function(object, params) {
			object = object || {};
			_.mapObject(params, function(newValue, field) {
				object[field] = newValue;
				return true;
			});
			return object;
		};

		service.removeFromObject = function(object, id) {
			delete object[id];
			return object;
		};

		service.addToArray = function(array, item) {
			if (!array) {
				array = [];
			}
			array.push(item);
			return array;
		}

		/******************************************************************************************************************/
		// StringHelper

		service.ucfirst = function(str) {
			if (_.isEmpty(str)) return '';
	        var parts = str.split(' ');
	        var words = [];

	        for (var i = 0; i < parts.length; i++) {
	            var part = parts[i];
	            var first = part[0].toUpperCase();
	            var rest = part.substring(1, part.length);
	            var word = first + rest;
	            words.push(word);
	        }
	        return words.join(' ');
	    };

		return service;
	}();
};