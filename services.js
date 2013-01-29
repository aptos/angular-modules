var appServices = angular.module('appServices', ['ngResource']);

appServices.factory('Profile', ['$resource', function($resource){
	return $resource('profile', {}, { 
		'get': { method:'GET' }
	})
}]);

appServices.factory('Share', ['$resource', function($resource){
	return $resource('share/:via', {}, { 
		'email': { method:'POST', params: { via: "email" } }
	})
}]);

appServices.factory('Settings', ['$resource', function($resource){
	return $resource('settings/:id/:collection', {
		id: "@id",
		collection: "@collection",
	}, { 
		'get': { method:'GET' },
		'contact': { method:'GET', params: {collection: "contact"} },
		'update': { method: 'PUT' }
	})
}]);

appServices.factory('User', ['$resource', function($resource){
	return $resource('users/:id/:collection/:item', {
		id: "@id",
		collection: "@collection",
		item: "@item"
	},
	{
		'update': { method: 'PUT' },
		'update_linkedin': { method: 'GET', params: {collection: "update_linkedin"} },
		'review': { method: 'GET', params: {collection: "review"} },
		'rating': { method: 'GET', params: {collection: "rating"} },
		'create_review': { method: 'POST', params: {collection: "review"} },
		'reviews': { method: 'GET', params: {collection: "reviews"}, isArray: true }
	})
}]);

// register the interceptor as a service, intercepts ALL angular ajax http calls
// here we turn on the loading animated icon
appServices.factory('myHttpInterceptor', ['$q', '$window', function ($q, $window) {
	return function (promise) {
		return promise.then(function (response) {
            // do something on success
            $('#loading').hide();
            return response;

        }, function (response) {
            // do something on error
            $('#loading').hide();
            return $q.reject(response);
        });
	};
}]);

// Support accessing acceptance of terms and conditions from any controller
// In the controller, set up a watcher:
//
// function ControllerOne($scope, mySettings) {
//     $scope.$on('watchSettings', function() {
//         $scope.settings = mySettings.settings
//     });
// }
// ControllerOne.$inject = ['$scope', 'mySettings'];
//
appServices.factory('mySettings',['$rootScope', function($rootScope) {
    var broadcaster = {};

    broadcaster.update = function(updated_settings) {
      this.settings = updated_settings
      $rootScope.$broadcast('watchSettings');
    };
    return broadcaster;
}]);