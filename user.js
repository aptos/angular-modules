$(function(){
	var blitz = angular.module('blitz');

	blitz.service('User', ['$http', '$window', '$timeout', 'Storage', function($http, $window, $timeout, Storage) {
		var USERKEY = 'user';

		this.get = function() {
			return Storage.get(USERKEY) || {};
		};

		this.action = function(action, $scope) {
			return function() {
				var user = angular.copy($scope[USERKEY]);
				console.info(action, $scope);
				var errorHandler = function (data) {
					if (data && data.reason) {
						$scope.form.$setValidity('server', false);
						$scope.error = data.reason;
					}
				};
				$http.post(action, user).success(function(data) {
					if(data.ok) {
						delete $scope.error;
						$scope.success = true;
						var redirect = data.redirect;
						if (redirect) {
							$timeout(function() {$window.location.replace(redirect);}, 1000);
						}
					}
					else {
						errorHandler(data);
					}
				}).error(errorHandler);
				return false;
			};
		};

		this.observe = function($scope) {
			$scope.$watch(USERKEY, function(user) {
				$scope.form.$setValidity('server', true);
				Storage.set(USERKEY, user);
			}, true);
		};
	}]);

	blitz.controller('SignupController',['$scope', 'User', function($scope, User){
		User.observe($scope);
		$scope.user = User.get();
		$scope.register = User.action('/signup', $scope);
	}]);

	blitz.controller('LoginController',['$scope', 'User', function($scope, User){
		User.observe($scope);
		$scope.user = User.get();
		$scope.login = User.action('/login', $scope);
	}]);

	blitz.controller('ResetPasswordController',['$scope', 'User', function($scope, User){
		User.observe($scope);
		$scope.user = User.get();
		$scope.reset = User.action('/login/reset', $scope);
	}]);

	blitz.controller('ChangePasswordController',['$scope', '$location', 'User', function($scope, $location, User){
		User.observe($scope);
		$scope.user = User.get();
		$scope.change = User.action($location.absUrl(), $scope);
	}]);
});
