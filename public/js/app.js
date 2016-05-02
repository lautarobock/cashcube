(function() {

	var app = angular.module("app", [
		'ngResource',
		'ui.bootstrap',
		'ui.router',
		'overview',
		'movement',
		'newItem',
		'chart.js']);

	var MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio', 'Julio', 'Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

	app.config(function($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.otherwise("/movement");

		$stateProvider
		    .state('overview', {
		      url: "/overview",
		      templateUrl: "partial/overview/overview.html",
		      controller: 'OverviewController'
		    })
		    .state('movement', {
		      url: "/movement",
		      templateUrl: "partial/overview/movement.html",
		      controller: "MovementController"
		    })
		    .state('new-item', {
		      url: "/new-item/:id",
		      templateUrl: "partial/overview/new-item.html",
		      controller: "NewItemController",
			  resolve: {
				mode: function() {
					return 'edit';
				}
			  }
		    })
		    .state('clone', {
		      url: "/clone/:id",
		      templateUrl: "partial/overview/new-item.html",
		      controller: "NewItemController",
			  resolve: {
				mode: function() {
					return 'clone';
				}
			  }
		    })
		    .state('charts', {
		      url: "/charts",
		      templateUrl: "partial/overview/charts.html",
		      controller: "ChartsController"
		    });
	});

	app.run(function($rootScope, $state, $http) {
		$rootScope.currentState = function() {
			return $state.current.name;
        };


		$rootScope.accounts = {};
		$rootScope.currencies = {};
		$rootScope.allTags = {};
		$http.get("account").success(function(accounts) {
			for ( var k in accounts ) {
				$rootScope.accounts[accounts[k]._id] = accounts[k];
			}
			$rootScope.accountsList = accounts;
		});
		$http.get("currency").success(function(currencies) {
			for ( var k in currencies ) {
				$rootScope.currencies[currencies[k]._id] = currencies[k];
			}
		});
		$rootScope.getAccount = function(name) {
			return $rootScope.accounts[name];
		};
		$rootScope.getCurrency = function(name) {
			if ($rootScope.getAccount(name)) {
				return $rootScope.currencies[$rootScope.getAccount(name).currency];
			}
		};
		$http.get('movement-tags').success(function(tags) {
			$rootScope.allTags = tags;
		});

		//Global filters
		$rootScope.filters = {};
		$rootScope.filters.searchText = '';
		$rootScope.filters.searchTags = '';
		$rootScope.filters.searchAccount = '';
		$rootScope.filters.searchAccountTarget = '';
		$rootScope.filters.searchInBoth = false;
		$rootScope.filters.searchFromDate = null;
		$rootScope.filters.searchToDate = null;
		$rootScope.filters.searchDateExact = false;
		$rootScope.filters.PAGE_SIZE = 10;

		//months
		$rootScope.months = [];

	    var yearStart = 2014;
	    var monthStart = 10;

	    var today = new Date();
	    var yearEnd = today.getYear()+1900;
	    var monthEnd = today.getMonth()+1;

	    var formatMonth= function(month) {
	        if ( m<10 ) {
	            return '0'+m;
	        } else {
	            return m;
	        }
	    };

	    for ( var y=yearStart; y<=yearEnd; y++ ) {
	        var mEnd = 12;
	        if ( y == yearEnd ) {
	            mEnd = monthEnd;
	        }
	        for ( var m=monthStart; m<=mEnd; m++ ) {
	            //last day of month
	            var dummy = new Date(y-1900,m,1);
	            dummy.setDate(0);
	            var month = {
	                year: y,
	                month: m,
					id: ''+y+formatMonth(m),
	                value: MONTHS[m-1] + ' de ' + y,
	                lastDay: dummy.getDate()
	            };
	            $rootScope.months.push(month);
	        }
	        monthStart = 1;
	    }
	});

	app.factory('Movement',function($resource) {
	    return $resource('movement/:id',{id: '@_id'},{
	        query: { method: 'GET', params: {   }, isArray:true  },
	        save: { method: 'PUT', params: { }},
	        add: { method: 'POST', params: { }}
	    });
	});

	app.filter("pageFilter",function() {
        return function(rows,page,pageSize) {
            var from = (page-1)*(pageSize);
            var to = from + (pageSize);
            return rows.slice(from,to);
        };
    });

	app.directive('focusMe', function($timeout, $parse) {
	  return {
	    //scope: true,   // optionally create a child scope
	    link: function(scope, element, attrs) {
	      var model = $parse(attrs.focusMe);
	      scope.$watch(model, function(value) {
	        console.log('value=',value);
	        if(value === true) {
	          $timeout(function() {
	            element[0].focus();
	          });
	        }
	      });
	    }
	  };
	});

	app.controller('ChartsController', function($scope, $http, $filter, $q) {
		var format = $filter('date');
		var now = new Date().getTime();
		var from = format(new Date(now-1000*60*60*24*365),'yyyyMM');
		$scope.selected = 'super';
		$scope.from = $scope.months[$scope.months.length-13];
		$scope.to = $scope.months[$scope.months.length-2];

		function load() {
			$scope.sum = 0;
			$scope.sumCurrency = 0;
			$scope.avg = 0;
			$scope.avgCurrency = 0;
			$scope.desv = 0;
			$scope.desvCurrency = 0;
			$scope.max = 0;
			$scope.maxCurrency = 0;
			$scope.min = Math.pow(2,1024);
			$scope.minCurrency = Math.pow(2,1024);
			var query = '/chart/'+$scope.selected+'?from='+$scope.from.id+'&to='+$scope.to.id;
			var queryExpenses = '/chart/expenses?from='+$scope.from.id+'&to='+$scope.to.id;
			if ( $scope.tags ) query += '&tags=' + $scope.tags;
			$http.get(query).then(function(result) {
				$scope.all = result.data;
				$scope.labels = [];
	    		$scope.series = ['€','AR$'];
	    		$scope.data = [
	      			[],[]
	    		];
				$scope.accountTop = _.find($scope.expenses, {name:$scope.selected}).max;
				angular.forEach(result.data,function(item) {
					$scope.data[0].push(item.total);
					$scope.data[1].push(item.totalCurrency);
					$scope.labels.push(item.year+'/'+item.month);
					$scope.sum += item.total;
					$scope.sumCurrency += item.totalCurrency;
					$scope.max = Math.max($scope.max,item.total);
					$scope.maxCurrency = Math.max($scope.maxCurrency,item.totalCurrency);
					$scope.min = Math.min($scope.min,item.total);
					$scope.minCurrency = Math.min($scope.minCurrency,item.totalCurrency);
				});
				$scope.avg = $scope.sum/result.data.length;
				$scope.avgCurrency = $scope.sumCurrency/result.data.length;
				//calculo desvio estandar
				angular.forEach(result.data,function(item) {
					$scope.desv += (item.total-$scope.avg)*(item.total-$scope.avg);
					$scope.desvCurrency += (item.totalCurrency-$scope.avgCurrency)*(item.totalCurrency-$scope.avgCurrency);
				});
				$scope.desv = $scope.desv / result.data.length-1;
				$scope.desv = Math.sqrt($scope.desv);
				$scope.desvCurrency = $scope.desvCurrency / result.data.length-1;
				$scope.desvCurrency = Math.sqrt($scope.desvCurrency);
			});

			$scope.sumExpenses = 0;
			$scope.maxExpenses = 0;
			$scope.minExpenses = Math.pow(2,1024);
			$scope.desvExpenses = 0;
			$http.get(queryExpenses).then(function(result) {
				$scope.allExpenses = result.data;
				$scope.labelsExpenses = [];
				$scope.seriesExpenses = ['Express'];
				$scope.dataExpenses = [
					[]
				];
				angular.forEach(result.data,function(item) {
					$scope.dataExpenses[0].push(item.total);
					$scope.labelsExpenses.push(item.year+'/'+item.month);
					$scope.sumExpenses += item.total;
					$scope.maxExpenses = Math.max($scope.maxExpenses,item.total);
					$scope.minExpenses = Math.min($scope.minExpenses,item.total);
				});
				$scope.avgExpenses = $scope.sumExpenses/result.data.length;
				//calculo desvio estandar
				angular.forEach(result.data,function(item) {
					$scope.desvExpenses += (item.total-$scope.avgExpenses)*(item.total-$scope.avgExpenses);
				});
				$scope.desvExpenses = $scope.desvExpenses / result.data.length-1;
				$scope.desvExpenses = Math.sqrt($scope.desvExpenses);
			});
		}
		load();

		// $q.all([$http.get('/overview/incomes'),$http.get('/overview/expenses')]).then(function(responses) {
		// 	$scope.allCombo = responses[0].data.concat(responses[1].data);
		// });
		$http.get('/overview/incomes').then(function(result) {
			$scope.incomes = result.data;
		});
		$http.get('/overview/expenses').then(function(result) {
			$scope.expenses = result.data;
		});

		$scope.changeAccount = function(selected) {
			load();
		};
	});

})();
