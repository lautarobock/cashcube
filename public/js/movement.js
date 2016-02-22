(function() {

	var movement = angular.module("movement", ['ui.bootstrap']);

	movement.controller("MovementController", function(
		$scope,
		Movement,
		MovementCount,
		$timeout,
		$modal,
		$rootScope
	) {
		$scope.MAX_PAGES = 20;
		$scope.currentPage = 1;

		$scope.changePage = function() {
			loadPage();
		};

		$scope.clearSearch = function() {
			$rootScope.filters.searchText = '';
			loadPage();
		};
		$scope.clearTags = function() {
			$rootScope.filters.searchTags = '';
			loadPage();
		};
		var tags = {};
		var types = ['label-default','label-primary','label-success','label-info','label-warning','label-danger'];
		var next = 0;
		$scope.getTagType = function(tag) {
			if (tags[tag]) {
				return tags[tag];
			}
			tags[tag] = types[next];
			next++;
			if ( next>types.length ) next = 0;
		};
		$scope.tagToList = function(tags) {
			var tmp = tags.split(',');
			for (var i=0;i<tmp.length; i++ ) {
				tmp[i] = tmp[i].trim();
			}
			return tmp;
		};
		$scope.searchOrigin = function(account) {
			$rootScope.filters.searchAccount = account;
			loadPage();
		};
		$scope.searchTarget = function(account) {
			$rootScope.filters.searchAccountTarget = account;
			loadPage();
		};
		$scope.searchTag = function(tag) {
			$rootScope.filters.searchTags = tag;
			loadPage();
		};
		// $rootScope.filters.searchAccount = '';
		$scope.clearAccount = function() {
			$rootScope.filters.searchAccount = '';
			$rootScope.filters.searchInBoth = false;
			loadPage();
		};
		// $rootScope.filters.searchAccountTarget = '';
		$scope.clearAccountTarget = function() {
			$rootScope.filters.searchAccountTarget = '';
			loadPage();
		};
		//Date
		$scope.searchDateOpened = {
			from: false,
			to: false
		};
		// $rootScope.filters.searchFromDate = null;
		// $rootScope.filters.searchToDate = null;
		// $rootScope.filters.searchDateExact = false;
		$scope.open = function(field) {
			$scope.searchDateOpened[field] = true;
		};
		$scope.clearFromDate = function() {
			$rootScope.filters.searchFromDate = null;
			loadPage();
		};
		$scope.clearToDate = function() {
			$rootScope.filters.searchToDate = null;
			loadPage();
		};
		$scope.$watch('filters.searchDateExact', function(value) {
			if ( value ) {
				$rootScope.filters.searchToDate = null;
			}
			loadPage();
		});

		$scope.clearFilters = function() {
			$rootScope.filters.searchText = '';
			$rootScope.filters.searchTags = '';
			$rootScope.filters.searchAccount = '';
			$rootScope.filters.searchAccountTarget = '';
			$rootScope.filters.searchInBoth = false;
			$rootScope.filters.searchFromDate = null;
			$rootScope.filters.searchToDate = null;
			$rootScope.filters.searchDateExact = false;
			loadPage();
		};

		// $rootScope.filters.searchInBoth = false;
		$scope.$watch('filters.searchInBoth', function(value) {
			if ( value ) {
				$rootScope.filters.searchAccountTarget = '';
			}
			loadPage();
		});

		var activeTimeout = null;

        $scope.search = function(noWait) {
            if ( activeTimeout ) $timeout.cancel(activeTimeout);
			if ( noWait) {
				loadPage();
			} else {
				activeTimeout = $timeout(function() {
	                loadPage();
	            },500);
			}

        };

        $scope.$watch("filters.PAGE_SIZE", function() {
        	loadPage();
        });

		function loadPage() {
			var params = {
				page: $scope.currentPage,
				pageSize: $rootScope.filters.PAGE_SIZE
			};
			if ( $rootScope.filters.searchText ) {
				params.filter = {
					description: {"$regex": $rootScope.filters.searchText,"$options": 'i'}
				}
			}
			if ( $rootScope.filters.searchTags ) {
				params.filter = params.filter || {};
				params.filter.tags= $rootScope.filters.searchTags;
			}
			if ( $rootScope.filters.searchAccount ) {
				params.filter = params.filter || {};
				params.filter.account = $rootScope.filters.searchAccount;
			}
			if ( $rootScope.filters.searchAccountTarget ) {
				params.filter = params.filter || {};
				params.filter.accountTarget = $rootScope.filters.searchAccountTarget;
			}
			if ( $rootScope.filters.searchInBoth ) {
				params.filter = params.filter || {};
				params.filter.searchInBoth = $rootScope.filters.searchInBoth;
			}
			if ( $rootScope.filters.searchFromDate ) {
				params.filter = params.filter || {};
				params.filter.searchFromDate = $rootScope.filters.searchFromDate;
			}
			if ( $rootScope.filters.searchToDate ) {
				params.filter = params.filter || {};
				params.filter.searchToDate = $rootScope.filters.searchToDate;
			}
			if ( $rootScope.filters.searchDateExact ) {
				params.filter = params.filter || {};
				params.filter.searchFromDate = $rootScope.filters.searchFromDate;
				params.filter.searchToDate = $rootScope.filters.searchFromDate;
			}


			$scope.movements = Movement.query(params);

			MovementCount.count(params,function(count) {
				$scope.count = count.value;
			});
			MovementCount.total(params,function(count) {
				$scope.totalEuro = count.value;
			});
		}

		$scope.remove = function (movement) {

		    var modalInstance = $modal.open({
		      templateUrl: 'remove.html',
		      controller: function($scope, $modalInstance, movement) {
				$scope.ok = function () {
					movement.$remove(function() {
					 	$modalInstance.close('ok');
					 	loadPage();
					});

				};

				$scope.cancel = function () {
				    $modalInstance.dismiss('cancel');
				};
		      },
		      size: 'sm',
		      resolve: {
		        movement: function () {
		          return movement;
		        }
		      }
		    });

		    modalInstance.result.then(function (result) {
		    }, function () {
		      	console.log('Modal dismissed at: ' + new Date());
		    });
		};



	});

	movement.factory('MovementCount',function($resource) {
	    return $resource('movement-count/:mode',{},{
	        count: { method: 'GET', params: { mode:'count'  }, isArray:false  },
	        total: { method: 'GET', params: { mode:'total'  }, isArray:false  },
	    });
	});

})();
