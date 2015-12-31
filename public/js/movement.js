(function() {

	var movement = angular.module("movement", ['ui.bootstrap']);

	movement.controller("MovementController", function($scope, Movement, MovementCount, $timeout, $modal) {
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
		$scope.searchTag = function(tag) {
			$scope.searchTags = tag;
			loadPage();
		};
		$scope.searchAccount = '';
		$scope.clearAccount = function() {
			$scope.searchAccount = '';
			$scope.searchInBoth = false;
			loadPage();
		};
		$scope.searchAccountTarget = '';
		$scope.clearAccountTarget = function() {
			$scope.searchAccountTarget = '';
			loadPage();
		};
		//Date
		$scope.searchDateOpened = {
			from: false,
			to: false
		};
		$scope.searchFromDate = null;
		$scope.searchToDate = null;
		$scope.searchDateExact = false;
		$scope.open = function(field) {
			$scope.searchDateOpened[field] = true;
		};
		$scope.clearFromDate = function() {
			$scope.searchFromDate = null;
			loadPage();
		};
		$scope.clearToDate = function() {
			$scope.searchToDate = null;
			loadPage();
		};
		$scope.$watch('searchDateExact', function(value) {
			if ( value ) {
				$scope.searchToDate = null;
			}
			loadPage();
		});

		$scope.clearFilters = function() {
			$scope.searchText = '';
			$scope.searchTags = '';
			$scope.searchAccount = '';
			$scope.searchAccountTarget = '';
			$scope.searchInBoth = false;
			$scope.searchFromDate = null;
			$scope.searchToDate = null;
			$scope.searchToDate = null;
			$scope.searchDateExact = false;
			loadPage();
		};

		$scope.searchInBoth = false;
		$scope.$watch('searchInBoth', function(value) {
			if ( value ) {
				$scope.searchAccountTarget = '';
			}
			loadPage();
		});

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
			if ( $scope.searchAccount ) {
				params.filter = params.filter || {};
				params.filter.account = $scope.searchAccount;
			}
			if ( $scope.searchAccountTarget ) {
				params.filter = params.filter || {};
				params.filter.accountTarget = $scope.searchAccountTarget;
			}
			if ( $scope.searchInBoth ) {
				params.filter = params.filter || {};
				params.filter.searchInBoth = $scope.searchInBoth;
			}
			if ( $scope.searchFromDate ) {
				params.filter = params.filter || {};
				params.filter.searchFromDate = $scope.searchFromDate;
			}
			if ( $scope.searchToDate ) {
				params.filter = params.filter || {};
				params.filter.searchToDate = $scope.searchToDate;
			}
			if ( $scope.searchDateExact ) {
				params.filter = params.filter || {};
				params.filter.searchFromDate = $scope.searchFromDate;
				params.filter.searchToDate = $scope.searchFromDate;
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
