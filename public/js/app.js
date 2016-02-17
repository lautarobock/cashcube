(function() {

	var app = angular.module("app", [
		'ngResource',
		'ui.bootstrap',
		'ui.router',
		'overview',
		'movement',
		'newItem',
		'chart.js']);

	app.config(function($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.otherwise("/overview");

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
			return $rootScope.currencies[$rootScope.getAccount(name).currency];
		};

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
	      // // to address @blesh's comment, set attribute value to 'false'
	      // // on blur event:
	      // element.bind('blur', function() {
	      //    console.log('blur');
	      //    scope.$apply(model.assign(scope, false));
	      // });
	    }
	  };
	});

	app.controller('ChartsController', function() {

	});

})();
