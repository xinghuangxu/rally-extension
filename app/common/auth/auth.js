angular.module('spark.auth', [])

    .service('auth',['authService','$location','$rootScope',function(authService,$location,$rootScope){
        this.checkLogin=function(){
            authService.login({},
                //Success call: Delete username/password and load data fields
                function (val, response) {
                    if (!val.status) {
                        //$rootScope.user = val.user;
                        $location.path('/login');
                    }else{
                        $rootScope.user = val.user;
                    }
                }
            );
        }
    }])

    .service('authService', ['$resource', function ($resource) {
    return $resource(
        '../php/public/rally',
        {},
        {
            login: {method: 'POST', url: '../php/public/rally/login', timeout: '15000'},
            logout: {method: 'POST', url: '../php/public/rally/logout', timeout: '15000'}
        }
    );
}]);