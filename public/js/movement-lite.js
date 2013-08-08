
var movement = angular.module('cashcube.movement',['ngResource','ui.bootstrap']);

movement.factory('Movement',function($resource) {
    return $resource('movement',{},{
        query: { method: 'GET', params: {   },isArray:true  }
    });
});

movement.factory('Account',function($resource) {
    return $resource('account',{},{
        query: { method: 'GET', params: {   },isArray:true  }
    });
});

var PAGE_SIZE = 20;

movement.filter("page",function() {
    return function(movements,page) {
		var from = (page-1)*PAGE_SIZE;
		var to = from + PAGE_SIZE;
        return movements.slice(from,to);
    };
});

movement.controller("MovementLiteController", function($scope,Movement,Account) {
	$scope.loading = 0;
	
	$scope.today = new Date();
	$scope.today.setMilliseconds(0);
	$scope.today.setSeconds(0);
	$scope.today.setMinutes(0);
	$scope.today.setHours(0);
	$scope.isToday = function(date) {
		return $scope.today.getDate() == date.getDate() && $scope.today.getMonth() == date.getMonth() && $scope.today.getYear() == date.getYear();
	};
	$scope.todayStyle = function(date) {
		if ( $scope.isToday(new Date(date)) ) {
			return {color: 'blue'};
		} else {
			return null;
		}
	};
	
	//Should move to DB account config (asi siempre se muestra de ese color en la app)
	$scope.color = {
		cash:'green',
		caixa:'orange',
		tarjeta: 'red',
		salidas: 'green',
		bonus: 'grey',
		vicio: 'black',
		super: 'blue'
	};
	
	$scope.page = 1;	
	
	$scope.movements = Movement.query(function(){
		$scope.totalPages = ($scope.movements.length/PAGE_SIZE)+1;
	});
	
	$scope.accountName = {};
	$scope.accounts = Account.query(function() {
		angular.forEach($scope.accounts,function(account){
			$scope.accountName[account._id] = account;
		});
	});
	
	//Generalize, create a directive with menu
    $scope.navigateTo = function(href) {
        window.location.href = href;
    };

});


