
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

bonus.controller("NewItemController", function($scope,Movement,$timeout,Account, $state, $stateParams) {
	$scope.loading = 0;

    $scope.availableAccount = ['cash_peso','credito_rio', 'cash'];

    $scope.availableAccountTarget = ['vicio','bonus','super','salidas','fijos'];

	$scope.accounts = Account.query();

    if ( $stateParams.id ) {

        Movement.get({
            id: $stateParams.id
        }, function(item) {
            $scope.item = item;
            $scope.item.tags = $scope.item.tags.join(",");
            $scope.actualAmount = Math.round(($scope.item.amount * $scope.item.accountCurrency)*100)/100;
        });
    } else {
        $scope.actualAmount = 0;
        $scope.item = {
            date: new Date(),
            amount: 0,
            account:'cash_peso',
            accountTarget: 'bonus',
            tags: '',
            accountCurrency:1,
            accountTargetCurrency:1
        };
    }

    // $scope.$watch("item.amount", function(value) {
    //     value = value || 0;
    //     $scope.actualAmount = Math.round(($scope.item.amount * $scope.item.accountCurrency)*100)/100;
    // });

    $scope.$watch("actualAmount", function(value) {
        // value = value || 0;
        if ( value ) $scope.item.amount = Math.round((value / $scope.item.accountCurrency)*100)/100;
    });

    $scope.$watch("item.accountCurrency", function(value) {
        // value = value || 0;
        if ( value ) $scope.item.amount = Math.round(($scope.actualAmount / $scope.item.accountCurrency)*100)/100;
    });

    var first = true;
    $scope.$watch("item.account", function(value) {
        if ( value ) {
            console.log("change", value, $scope.getCurrency(value));
            //cuando esta editando y es la primera vuelta le dejo el currency q traia
            if ( !(first && $scope.item._id) ) {
                $scope.item.accountCurrency = $scope.getCurrency(value).value;
            }
            first = false;
            // $scope.item.amount = Math.round(($scope.actualAmount / $scope.item.accountCurrency)*100)/100;
        }
    });

    var firstTarget = true;
    $scope.$watch("item.accountTarget", function(value) {
        if ( value  ) {
            if ( !(firstTarget && $scope.item._id) ) {
                $scope.item.accountTargetCurrency = $scope.getCurrency(value).value;
            }
            firstTarget = false;
        }
    });

    $scope.changeAccount = function() {

    };

    $scope.blurAmount = function() {
        $scope.actualAmount = eval('(' + $scope.actualAmount + ')');
    };

	$scope.save = function() {
		$scope.loading = 1;
        $scope.item.date = new Date($scope.item.date);
        $scope.item.date.setMilliseconds(0);
        $scope.item.date.setSeconds(0);
        $scope.item.date.setMinutes(0);
        $scope.item.date.setHours(0)
        // $scope.item.amount = eval('(' + $scope.item.amount + ')') / $scope.item.accountCurrency;
        if ( $scope.item._id ) {
            var result = Movement.save($scope.item, function(newItem) {
                $scope.loading = 0;
                $state.go("movement");
            });
        } else {
            var result = Movement.add($scope.item, function(newItem) {
                $scope.loading = 0;
                $state.go("movement");
            });
        }

	};

	$scope.showDatePicker = false;
});
