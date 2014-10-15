
var bonus = angular.module('newItem',['ngResource', 'ui.bootstrap']);

bonus.factory('Account',function($resource) {
    return $resource('account',{},{
        query: { method: 'GET', params: {   },isArray:true  }
    });
});



bonus.filter("selected",function() {
    return function(accounts,availableAccount) {
        var result = [];
		angular.forEach(accounts,function(account) {
				if (availableAccount.indexOf(account._id) !== -1) {
					result.push(account);
				}
		});
        return result;
    };
});

bonus.controller("NewItemController", function($scope,Movement,$timeout,Account, $state) {
	$scope.loading = 0;

    $scope.availableAccount = ['cash_peso','credito_rio', 'cash'];

    $scope.availableAccountTarget = ['vicio','bonus','super','salidas','fijos'];

	$scope.accounts = Account.query();
	
    $scope.item = {
        date: new Date(),
        account:'cash_peso',
        accountTarget: 'bonus',
        tags: '',
        accountCurrency:1,
        accountTargetCurrency:1
	};

    $scope.$watch("item.account", function(value) {
        console.log("chamge", value, $scope.getCurrency(value));
        $scope.item.accountCurrency = $scope.getCurrency(value).value;
    });

    $scope.changeAccount = function() {
        
    };

	$scope.save = function() {
		$scope.loading = 1;
        $scope.item.date.setMilliseconds(0);
        $scope.item.date.setSeconds(0);
        $scope.item.date.setMinutes(0);
        $scope.item.date.setHours(0)
        $scope.item.amount = eval('(' + $scope.item.amount + ')') / $scope.item.accountCurrency;
        var result = Movement.save($scope.item, function(newItem) {
			$scope.loading = 0;
            $state.go("movement");
        });
	};

	$scope.showDatePicker = 0;
});


bonus.factory('Movement',function($resource) {
    return $resource('movement',{},{
        save: { method: 'POST', params: {}}
    });
});

