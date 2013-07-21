
var cashcube = angular.module('cashcube',['ngResource','ui.bootstrap']);

cashcube.filter("valueFilter",function() {
    return function(value) {
        if ( !value ) return '';
        return -value;
    };
});

cashcube.filter('base',function() {
    return function(accounts) {
        var filtered = [];
        for ( var i=0; i<accounts.length; i++ ) {
            if ( accounts[i].category === 'base' ) {
                filtered.push(accounts[i]);
            }
        }
        for ( var i=0; i<accounts.length; i++ ) {
            if ( accounts[i].category === 'fijo' ) {
                filtered.push(accounts[i]);
            }
        }
        for ( var i=0; i<accounts.length; i++ ) {
            if ( accounts[i].category === 'extra' ) {
                filtered.push(accounts[i]);
            }
        }
        return filtered;
    };
});

var MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio', 'Julio', 'Agosto','Septiembre','Noviembre','Diciembre'];

cashcube.controller("ProjectionController", function($scope,Movement,Account) {

    $scope.selected = null;

    $scope.months = [];

    var yearStart = 2013;
    var monthStart = 1;

    var today = new Date();
    var yearEnd = today.getYear()+1900;
    var monthEnd = today.getMonth()+1;

    var r = [];
    r.push({from:1,to:7});
    r.push({from:8,to:14});
    r.push({from:15,to:21});
    r.push({from:22,to:28});
    r.push({from:29,to:31});

    for ( var y=yearStart; y<=yearEnd; y++ ) {
        for ( var m=monthStart; m<=monthEnd; m++ ) {
            //last day of month
            var dummy = new Date(y-1900,m,1);
            dummy.setDate(0);
            var month = {
                year: y,
                month: m,
                value: MONTHS[m-1] + ' de ' + y,
                lastDay: dummy.getDate()
            };
            $scope.months.push(month);
            $scope.selected = month;
        }
    }


    $scope.movements = Movement.query($scope.selected);

    $scope.toMonth = function(month) {
        $scope.selected = month;

        r = [];
        r.push({from:1,to:7});
        r.push({from:8,to:14});
        r.push({from:15,to:21});
        r.push({from:22,to:28});
        if ( month.lastDay>28 ) {
            r.push({from:29,to:month.lastDay});
        }

        $scope.movements = Movement.query($scope.selected);
    };

    $scope.accounts = Account.query();

    $scope.getAccounts = function() {

    };

    $scope.weeks = function() {
        return r;
    };

    $scope.days = function (from,to) {
        var days = [];
        for(var i=from; i<=to; i++) {
            var d = i;
            days.push(d);
        }
        return days;
    };

    $scope.getClass = function(value) {
        if ( !value ) return '';
        if ( value < -100 ) return 'alert alert-error';
        if ( value < -10 ) return 'alert';
        return 'alert alert-success';
    }

    $scope.getPopover = function(items) {
        if ( !items ) return '';
        var text = '';
        for ( var i=0; i<items.length; i++ ) {
            text += '("'+items[i].description+'" [' + items[i].account;
            text += '] ';
            text += ',  ';
            text += 'Valor: ' + items[i].amount;
            text += '). ';
        }
        return text;
    };

    $scope.navigateTo = function(href) {
        window.location.href = href;
    };

});

cashcube.factory('Movement',function($resource) {
    var today = new Date();
    var year = today.getYear()+1900;
    var month = today.getMonth()+1;
    return $resource('cube/:year/:month',{}, {
        query: { method: 'GET', params: {   },isArray:false  }
    });
});
cashcube.factory('Account',function($resource) {
    //return $resource('data/account.json',{},{
    return $resource('account',{},{
        query: { method: 'GET', params: {}, isArray:true  }
    });
});