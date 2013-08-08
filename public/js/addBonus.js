
var bonus = angular.module('cashcube.quick.bonus',['ngResource','ui.bootstrap']);


bonus.controller("AddBonusController", function($scope,Movement,$timeout) {
	$scope.loading = 0;

	$scope.availableAccount = ['cash','caixa','tarjeta'];
	
    $scope.template = 'form.html';

	//Generalize, create a directive with menu
    $scope.navigateTo = function(href) {
        window.location.href = href;
    };

	$scope.item = {
        date: new Date(),
        account:'cash',
        accountTarget: 'bonus',
        tags: '',
        accountCurrency:1,
        accountTargetCurrency:1
	};

	$scope.save = function() {
		$scope.loading = 1;
        $scope.item.date.setMilliseconds(0);
        $scope.item.date.setSeconds(0);
        $scope.item.date.setMinutes(0);
        $scope.item.date.setHours(0)
        var result = Movement.save($scope.item, function() {
            $scope.template = 'success.html';
			$scope.loading = 0;
        });
	};

	$scope.showDatePicker = false;
	$scope.open = function() {
		$scope.showDatePicker = !$scope.showDatePicker;
	};
});


bonus.factory('Movement',function($resource) {
    return $resource('movement',{},{
        save: { method: 'POST', params: {}}
    });
});

