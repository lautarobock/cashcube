(function() {

	var app = angular.module("app", ['ngResource', 'ui.bootstrap', 'ui.router', 'overview', 'movement', 'newItem']);

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
		      url: "/new-item",
		      templateUrl: "partial/overview/new-item.html",
		      controller: "NewItemController"
		    })
		    ;
		    // .state('state1.list', {
		    //   url: "/list",
		    //   templateUrl: "partials/state1.list.html",
		    //   controller: function($scope) {
		    //     $scope.items = ["A", "List", "Of", "Items"];
		    //   }
		    // })
		    // .state('state2', {
		    //   url: "/state2",
		    //   templateUrl: "partials/state2.html"
		    // })
		    // .state('state2.list', {
		    //   url: "/list",
		    //   templateUrl: "partials/state2.list.html",
		    //   controller: function($scope) {
		    //     $scope.things = ["A", "Set", "Of", "Things"];
		    //   }
		    // });

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
	});

	app.factory('Movement',function($resource) {
	    return $resource('movement',{},{
	        query: { method: 'GET', params: {   },isArray:true  }
	    });
	});

	app.filter("pageFilter",function() {
        return function(rows,page,pageSize) {
            var from = (page-1)*(pageSize);
            var to = from + (pageSize);
            return rows.slice(from,to);
        };
    });

})();