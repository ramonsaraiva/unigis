'use strict';

var app = angular.module('app', [
	'ngRoute',
	'angularSpinners',
	'controllers',
	'services',
	'directives',
]);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'partials/map.tpl.html',
			controller: 'map_controller'
		})
		.otherwise({
			redirectTo: '/'
		});
}]);
