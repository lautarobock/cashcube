define("projection", [], function() {

    var app = angular.module("cc.projection", ['ngResource']);

    angular.element(document).ready(function() {
        angular.bootstrap(document, ['cc.projection']);
    });


    app.controller("ProjectionController", function($scope, Movement, Account) {

        $scope.byMonth = {};
        $scope.totals = [];
        $scope.usedAccounts = [];

        // function addRow() {
        //     $scope.byMonths.push({
        //         year: year,
        //         month: month,
        //         account: account,
        //         accountTarget: accountTarget
        //     });
        // }

        Movement.query(function(movements) {
            var year = 0;
            var month = -1;
            angular.forEach(movements, function(mov) {
                var date = new Date(mov.date);
                var monthID = date.getYear() + "_" + date.getMonth();
                if ( !$scope.byMonth[monthID] ) {
                    $scope.byMonth[monthID] = {
                        monthID: monthID,
                        year: date.getYear(),
                        month: date.getMonth(),
                        accounts: {}
                    };
                }

                if ( !$scope.byMonth[monthID].accounts[mov.account] ) {
                    $scope.byMonth[monthID].accounts[mov.account] = {
                        account: mov.account,
                        accountCurrency: mov.accountCurrency,
                        amount: 0
                    };
                }

                $scope.byMonth[monthID].accounts[mov.account].amount += mov.amount;
            });

            angular.forEach($scope.byMonth, function(month) {
                $scope.totals.push(month);
                angular.forEach(month.accounts, function(account) {
                    if ( $scope.usedAccounts.indexOf(account.account) == -1 ) {
                        $scope.usedAccounts.push(account.account);
                    }
                });
                
            });
        });


        //Load Accounts
        $scope.accounts = {};
        Account.query(function(accounts) {
            angular.forEach(accounts, function(account) {
                $scope.accounts[account._id] = account;
            });
        });

    });


    app.factory('Movement',function($resource) {
        return $resource('movement',{},{
            query: { method: 'GET', params: {   },isArray:true  }
        });
    });

    app.factory('Account',function($resource) {
        return $resource('account',{},{
            query: { method: 'GET', params: {   },isArray:true  }
        });
    });

});