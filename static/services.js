'use strict';

var services = angular.module('services', []);

services.factory('db', ['$http', function($http, module) {

	function db(module)
	{
		this.m = module;
		this.url = '/api/' + this.m + '/';
	}

	db.prototype.create = function(record) {
		return $http.post(this.url, record);
	};

	db.prototype.read = function(id) {
		return $http.get(this.url + id + '/');
	};

	db.prototype.update = function(id, record) {
		return $http.patch(this.url + id + '/', record);
	};

	db.prototype.delete = function(id) {
		return $http.delete(this.url + id + '/');
	};

	db.prototype.list = function() {
		return $http.get(this.url);
	};

	db.prototype.list_q = function(q) {
		return $http.get(this.url + '?q=' + q);
	};

	db.prototype.get = function(url) {
		return $http.get(this.url + url);
	};

	db.prototype.post = function(url, data) {
		return $http.post(this.url + url, data);
	};

	return db;
}]);

services.factory('spinner', function() {
	function spinner()
	{
		this.spinning = false;
		$('.spin').append(new Spinner(spinner_options).spin().el);
	}

	spinner.prototype.start = function() {
		this.spinning = true;
	};

	spinner.prototype.stop = function() {
		this.spinning = false;
	};

	return spinner;
});
