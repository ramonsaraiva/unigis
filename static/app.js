'use strict';

var app = angular.module('app', [
	'ngRoute',
	'controllers',
	'services',
	'directives',
]);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/home/', {
			templateUrl: 'partials/home.tpl.html',
		})
		.when('/', {
			redirectTo: '/home/'
		})
		.otherwise({
			redirectTo: '/home/'
		});
}]);
