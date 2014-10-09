//factory service that calls to the php file (Old method used $http dependency)
angular.module('spark.rally').factory('RallyProject', function ($resource) {
        return $resource('../php/public/rally/projects/:projectId', {},
            {
                query: {method: 'GET', params: {projectId: 'projects'}}
            }
        )
    }
);