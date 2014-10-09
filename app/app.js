'use strict';

// Declare app level module which depends on views, and components
angular.module('spark', [
    'ngRoute',
    'ngResource',
    'ngSanitize',
    'ngAnimate',
    'spark.login',
    'spark.rally',
    'spark.auth'
]).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/rally'});
    }]).controller('rootController', ['$rootScope', 'authService', '$location', function ($rootScope, authService, $location) {

        $rootScope.logout = function () {
            function logoutAlways() {
                $rootScope.user = "";
            }
            authService.logout({}, logoutAlways, logoutAlways);
            $location.path('/login');
        };

    }]);
