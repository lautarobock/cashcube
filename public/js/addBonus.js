
var bonus = angular.module('cashcube.quick.bonus',['ngResource','ui.bootstrap']);


bonus.controller("AddBonusController", function($scope,Movement,$timeout) {
	$scope.loading = 0;

	//Generalize, create a directive with menu
    $scope.navigateTo = function(href) {
        window.location.href = href;
    };

	$scope.item = {
		date: new Date(),
		account: 'cash',
		accountTarget: 'bonus',
		accountCurrency:1,
		accountTargetCurrency:1
	};

	$scope.save = function() {
		Movement.save($scope.item);
	};

});


bonus.factory('Movement',function($resource) {
    return $resource('movement',{},{
        save: { method: 'POST', params: {}}
    });
});

