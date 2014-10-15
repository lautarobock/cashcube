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
		      url: "/new-item/:id",
		      templateUrl: "partial/overview/new-item.html",
		      controller: "NewItemController"
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
	    return $resource('movement/:id',{id: '@_id'},{
	        query: { method: 'GET', params: {   }, isArray:true  },
	        save: { method: 'PUT', params: { }}
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