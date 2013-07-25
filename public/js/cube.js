
var cashcube = angular.module('cashcube',['ngResource','ui.bootstrap']);

cashcube.filter("valueFilter",function() {
    return function(value,max) {
        if ( !value ) return '';
        return -value + (max?' ('+max+')':'');
    };
});

//cashcube.filter('section',function() {
//    return function(accounts,section) {
//        var filtered = [];
//        for ( var i=0; i<accounts.length; i++ ) {
//            if ( accounts[i].section === section ) {
//                filtered.push(accounts[i]);
//            }
//        }
//        return filtered;
//    };
//});

var MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio', 'Julio', 'Agosto','Septiembre','Noviembre','Diciembre'];

cashcube.controller("ProjectionController", function($scope,Cube,CubeDefinition) {

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

    var formatMonth= function(month) {
        if ( m<10 ) {
            return '0'+m;
        } else {
            return m;
        }
    };

    for ( var y=yearStart; y<=yearEnd; y++ ) {
        for ( var m=monthStart; m<=monthEnd; m++ ) {
            //last day of month
            var dummy = new Date(y-1900,m,1);
            dummy.setDate(0);
            var month = {
                year: y,
                month: m,
				id: ''+y+formatMonth(m),
                value: MONTHS[m-1] + ' de ' + y,
                lastDay: dummy.getDate()
            };
            $scope.months.push(month);
            $scope.selected = month;
        }
    }

	$scope.definition = CubeDefinition.get({id:$scope.selected.id},function() {
		for ( var i=0; i<$scope.definition.accounts.length; i++ ) {
			$scope.sections[$scope.definition.accounts[i].section].count++;
		}
	});

	$scope.sections = [
		{
			name: 'Base',
			count: 1
		},
		{
			name: 'Extra',
			count: 1
		}
	];
	


    $scope.movements = Cube.query($scope.selected);

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

        $scope.definition = CubeDefinition.get({id:$scope.selected.id});
        $scope.movements = Cube.query($scope.selected);

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

    $scope.getClassForWeek = function(value,account) {
        if ( !value  ) return '';
        if ( account.maxWeek && -value > account.maxWeek ) return 'text-error';
        //if ( value < -10 ) return 'alert';
        return 'text-success';
    };

    $scope.getClassForTotal = function(value,account) {
        if ( !value  ) return '';
        if ( account.maxMonth && -value > account.maxMonth ) return 'alert alert-error';
        //if ( value < -10 ) return 'alert';
        return 'alert alert-success';
    };

    $scope.getClass = function(value,account) {
        if ( !value  ) return '';
		if ( account.maxDay && -value > account.maxDay ) return 'text-error';
        //if ( value < -10 ) return 'alert';
        return 'text-success';
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

    $scope.saveDefinition = function() {
        $scope.definition.$save();
    };

});

cashcube.factory('Cube',function($resource) {
    var today = new Date();
    var year = today.getYear()+1900;
    var month = today.getMonth()+1;
    return $resource('cube/:year/:month',{}, {
        query: { method: 'GET', params: {   },isArray:false  }
    });
});
cashcube.factory('CubeDefinition',function($resource) {
    return $resource('cubedefinition/:id',{},{
        get: { method: 'GET', params: {}, isArray:false },
        save: { method: 'POST', params: {}}
    });
});
