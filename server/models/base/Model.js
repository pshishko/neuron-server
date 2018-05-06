module.exports = function(Server, config, _, pr) {

	'use strict';

	return function() {

		var EventEmitter = require('events');
		var emitter = new EventEmitter.EventEmitter();

		return {
			name : 'Model',
			params : {},
			isLoading : false,
			instance : function(name, params) {
				var newModel 	= _.clone(this);
				newModel.name 	= name;
				newModel.params = params;

				if (!params.socket) {
					pr('Model need specify param socket!!!', 1);
				}
				if (!params.apiAction) {
					params.apiAction = params.socket;
				}
				newModel.initActions();
				return newModel;
			},
			actions: {
				'view'		: 'get',
				'all'		: 'get',
				'add'		: 'post',
				'update'	: 'put',
				'remove'	: 'del'
			},
			observe: function() {

				var getSliceObject = function(list, page, limit) {
					var slicedObject = {};
					var count = 0;
					_.each(_.sortBy(list, 'created_at').reverse(), function(object, key) {
						if (count >= (page * limit)) {
							return slicedObject;
						} else if (count >= ((page - 1) * limit)) {
							slicedObject[object.id] = object;
						}
						count++;
					});
					return slicedObject;
				};

				return {
					list: {},
					count: -1,
					total: -1,
					isLoaded: function(params) {
						// была хоть одна загрузка и 
						// загружены все или загружено столько сколько нужно для лимита
						return (this.total >= 0 && (this.count == this.total || (params && params['per-page'] && params['per-page'] <= this.count)));
					},
					get: function(params) {
						if (params && params['per-page'] && params['per-page'] != 'all') {
							return getSliceObject(this.list, (params['page'] || 1), params['per-page']);
						} else {
							return this.list;		
						}
					},
					set: function(list, total) {
						this.total = total;
						var newList = Server.services.Helper.setObjectList(this.get(), list);
						this.count = _.size(newList);
						return newList;
					},
					view: function (id) {
						return this.exist(id) ? this.list[id] : false;
					},
					add: function(object, key) {
						this.count = this.count >= 0 ? this.count + 1 : 1;
						this.total = this.total >= 0 ? this.total + 1 : 1;
						var objectKey = key ? key : object.id;
						return Server.services.Helper.addToObject(this.get(), objectKey, object);
					},
					update: function(id, object) {
						return Server.services.Helper.updateObject(this.get()[id], object);
					},
					remove: function(id) {
						this.count--;
						this.total--;
						Server.services.Helper.removeFromObject(this.get(), id);
						return true;
					},
					exist: function(id) {
						return !_.isEmpty(this.list[id]);
					},
				};
			},
			initActions: function() {
				var _this = this;
				_.each(this.actions, function(type, action) {
					_this.initAction(type, action);
				});
			},
			initAction: function(type, action) {
				var _this = this;
				if (type != null) {
					_this[action] = function(access_token, data, callback, failCallback) {
						Server.services.Api[type](_this.params.apiAction, access_token, data, function(data, page, limit, total) {
							callback(data, page, limit, total);
						}, function(data) {
							if (failCallback) failCallback(data);
						});
					};
				}
				Server.services.Socket.addEvent(_this.getSocketAction(action), function(socket, model) {
					emitter.emit(_this.getSocketEvent(action), socket, model);
				});

			},
			getSocketAction: function(type) {
				return this.name + '.' + this.params.socket + (type ? Server.services.Helper.ucfirst(type) : '');
			},
			getSocketEvent: function(type) {
				return 'on' + Server.services.Helper.ucfirst(this.params.socket) + (type ? Server.services.Helper.ucfirst(type) : '');
			},
			on: function(event, callback) {
				emitter.on(this.getSocketEvent(event), function(socket, model) {
				  callback(socket, model);
				});
			}
		};
	}();
};