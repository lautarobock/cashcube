(function() {

	var overview = angular.module("overview", ['ui.bootstrap']);

	overview.run(function($rootScope) {

	});

	var DAYS = ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'];

	overview.controller("OverviewController", function($scope, $rootScope, $http, $state) {

		$scope.includeAjuste = true;

		//Month selection
		$scope.selected = $scope.months[$scope.months.length-1];

	    $scope.$watch("selected", function(month) {
	    	if ( month ) {
				reload();
	    	}
	    });

	   	$scope.$watch("includeAjuste", function(value, old) {
			//Skip reload at start
			if (old !== value) reload();
	    });


		$scope.normalize = function(label) {
			if ( label === '_' ) return "N/L";
			return label;
		};
		$scope.hasAccountDetail = function(value) {
			if ( value.total === 0 ) return false;
			var count = 0;
			var name = null;
			for ( var k in value.labels ) {
				name = k;
				count ++;
			}
			return !(count == 1 && name == '_');
		};
		$scope.styleCurrency = function(amount) {
			if ( amount < 0 ) {
				return {color:'red'};
			}
		};
		$scope.showDetails = {};
		$scope.showLabels = {};

		$scope.barType = function(value, max) {
			if ( value>max) {
				return 'danger';
			} else if ( value > (max*0.8) ) {
				return 'warning';
			} else {
				return 'success';
			}
		};

		// $scope.totals = {
		// 	balance: 0,
		// 	prev: 0,
		// 	diff: 0
		// }
		function reload() {
			$http.get("/overview/" + $scope.selected.year + "/" + $scope.selected.month + "?includeAjuste=" + $scope.includeAjuste).success(function(result) {
				console.log("ITEMS", result);
				$scope.items = result.expenses.items;
				$scope.overviewTotal = result.expenses.total;
				$scope.incomes = result.incomes.items;
				$scope.incomesTotal = result.incomes.total;
				$scope.chartData = [];
				$scope.chartLabels = [];
				angular.forEach(result.expenses.items, function(v,k) {
					$scope.chartData.push(Math.round(v.total));
					$scope.chartLabels.push(k + '('+v.sign+')');
				});
			});

			$http.get("/balance/" + $scope.selected.year + "/" + $scope.selected.month).success(function(items) {
				var totals = {
					balance: 0,
					prev: 0,
					diff: 0
				};
				console.log("Balance", items);

				$scope.balance = _.sortByOrder(
					items,
					[function(item) {
						return item.category;
					},
					function(item) {
						return $scope.getCurrency(item.account_id).sign;
					},
					function(item) {
						return item.account_id;
					}]
				);

				for ( var i=0; i<items.length; i++ ) {
					totals.balance += items[i].actual.credit - items[i].actual.debit;
					totals.prev += (items[i].prev.credit||0) - (items[i].prev.debit||0);
					totals.diff += items[i].actual.credit - items[i].actual.debit - ((items[i].prev.credit||0) - (items[i].prev.debit||0));
				}

				$scope.totals = totals;
			});
		}

		// $scope.chartData = [300, 500, 100];
		// $scope.chartLabels = ['Download Sales', 'In-Store Sales', 'Mail-Order Sales'];

		$scope.gotoAccountTarget = function(account, label) {
			$rootScope.clearAllFilters();
			var from = new Date($scope.selected.year + "/" + $scope.selected.month );
			from.setDate(1);
			var to = new Date($scope.selected.year + "/" + $scope.selected.month );
			to.setMonth(to.getMonth()+1);
			to.setDate(0);
			$rootScope.filters.searchFromDate = from;
			$rootScope.filters.searchToDate = to;
			$rootScope.filters.searchAccountTarget = account;
			if ( label ) {
				if ( label === '_' ) label = '';
				$rootScope.filters.searchTags = label;
			}
			$state.go('movement');
		};
		
		$scope.gotoAccount = function(account, label, searchInBoth) {
			$rootScope.clearAllFilters();
			var from = new Date($scope.selected.year + "/" + $scope.selected.month );
			from.setDate(1);
			var to = new Date($scope.selected.year + "/" + $scope.selected.month );
			to.setMonth(to.getMonth()+1);
			to.setDate(0);
			$rootScope.filters.searchFromDate = from;
			$rootScope.filters.searchToDate = to;
            $rootScope.filters.searchAccount = account;
            if (searchInBoth) {
                $rootScope.filters.searchInBoth = true;
            }
			if ( label ) {
				if ( label === '_' ) label = '';
				$rootScope.filters.searchTags = label;
			}
			$state.go('movement');
		};

	});

})();
