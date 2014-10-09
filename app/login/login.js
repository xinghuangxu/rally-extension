'use strict';

angular.module('spark.login', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'login/login.html',
            controller: 'loginCtrl'
        });
    }])
    .controller('loginCtrl', ['$scope', 'authService','$location','$rootScope', function ($scope, authService,$location,$rootScope) {
        //$scope.loginUserName = "";  //username showed on the toolbar
        //Function to automatically check stored login credentials
        //Call to authenticate credentials
        $scope.login = function (noinfo) {
            //Refreshes invalid login message so user knows when multiple failed logins occur
//            $scope.showMessage = false;
            //Service call for auth data
            authService.login(
                //Post parameters
                {
                    username: $scope.username,
                    password: $scope.password
                },
                //Success call: Delete username/password and load data fields
                function (val, response) {
                    if (val.status) {
                        $rootScope.user = val.user;
                        $location.path('/rally');
                    } else {
                        if(!noinfo){
                            $scope.error = val.message;
                        }
                    }
                },
                //Error call: Show invalid login message
                function (response) {
                    $scope.error = "Login failed."
                }
            );
        };
    }])
;