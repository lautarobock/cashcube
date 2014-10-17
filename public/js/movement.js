(function() {

	var movement = angular.module("movement", ['ui.bootstrap']);

	movement.controller("MovementController", function($scope, Movement, MovementCount, $timeout) {
		$scope.PAGE_SIZE = 10;
		$scope.MAX_PAGES = 20;
		$scope.currentPage = 1;

		$scope.changePage = function() {
			loadPage();
		};

		$scope.clearSearch = function() {
			$scope.searchText = '';
			loadPage();
		};
		$scope.clearTags = function() {
			$scope.searchTags = '';
			loadPage();
		}

		var activeTimeout = null;
                
        $scope.search = function() {
            if ( activeTimeout ) $timeout.cancel(activeTimeout);
            activeTimeout = $timeout(function() {
                loadPage();
            },500);
        };

        $scope.$watch("PAGE_SIZE", function() {
        	loadPage();
        });

		function loadPage() {
			var params = {
				page: $scope.currentPage,
				pageSize: $scope.PAGE_SIZE
			};
			if ( $scope.searchText ) {
				params.filter = {
					description: {"$regex": $scope.searchText,"$options": 'i'}
				}
			}
			if ( $scope.searchTags ) {
				params.filter = params.filter || {};
				params.filter.tags= $scope.searchTags;
			}

			$scope.movements = Movement.query(params);

			MovementCount.count(params,function(count) {
				$scope.count = count.value;
			});
			MovementCount.total(params,function(count) {
				$scope.totalEuro = count.value;
			});
		}
		

		
	});

	movement.factory('MovementCount',function($resource) {
	    return $resource('movement-count/:mode',{},{
	        count: { method: 'GET', params: { mode:'count'  }, isArray:false  },
	        total: { method: 'GET', params: { mode:'total'  }, isArray:false  },
	    });
	});

})();