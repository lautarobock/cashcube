(function() {

	var movement = angular.module("movement", ['ui.bootstrap']);

	movement.controller("MovementController", function($scope, Movement, $http) {
		$scope.PAGE_SIZE = 20;
		$scope.MAX_PAGES = 20;
		$scope.currentPage = 1;

		$scope.changePage = function() {
			loadPage();
		};

		function loadPage() {
			$scope.movements = Movement.query({
				page: $scope.currentPage,
				pageSize: $scope.PAGE_SIZE
			});
			$http.get("movement-count").success(function (count) {
				$scope.count = count.value;
			});	
		}
		loadPage();
		

		
	});

})();