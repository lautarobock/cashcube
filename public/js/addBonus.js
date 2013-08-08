
var bonus = angular.module('cashcube.quick.bonus',['ngResource','ui.bootstrap']);


bonus.controller("AddBonusController", function($scope,Movement,$timeout) {
	$scope.loading = 0;

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
//        $scope.error = null;
//        var date = new Date();
//        date.setYear(parseInt($scope.item.date.split('-')[0]));
//        date.setMonth(parseInt($scope.item.date.split('-')[1])-1);
//        date.setDate(parseInt($scope.item.date.split('-')[2]));
//        date.setMilliseconds(0);
//        date.setSeconds(0);
//        date.setMinutes(0);
//        date.setHours(0);
//        $scope.item.date = date;
        $scope.item.date.setMilliseconds(0);
        $scope.item.date.setSeconds(0);
        $scope.item.date.setMinutes(0);
        $scope.item.date.setHours(0)
        var result = Movement.save($scope.item, function() {
            $scope.template = 'success.html';
        });
	};

});


bonus.factory('Movement',function($resource) {
    return $resource('movement',{},{
        save: { method: 'POST', params: {}}
    });
});

