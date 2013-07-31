
var cashcube = angular.module('cashcube',['ngResource','ui.bootstrap']);

cashcube.filter("valueFilter",function() {
    return function(value,max) {
        if ( !value ) return '';
        return -value + (max?' ('+max+')':'');
    };
});

cashcube.filter('sectionFilter',function() {
    return function(accounts,section,movements) {
		if ( !accounts ) return;
        var filtered = [];
        for ( var i=0; i<accounts.length; i++ ) {
            if ( accounts[i].section === section && movements.month[accounts[i].account] && movements.month[accounts[i].account].value) {
                filtered.push(accounts[i]);
            }
        }
        return filtered;
    };
});

var MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio', 'Julio', 'Agosto','Septiembre','Noviembre','Diciembre'];
var DAYS = ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'];

cashcube.controller("ProjectionController", function($scope,Cube,CubeDefinition,Account) {

    $scope.accounts = Account.query();

	$scope.getDaw = function(day) {
		var date = new Date($scope.selected.year,$scope.selected.month-1,day);
		return DAYS[date.getDay()];
	};

	$scope.today = new Date();

	$scope.getRowClass = function (day) {
		if ( day === $scope.today.getDate() 
			&& ($scope.selected.month-1) === $scope.today.getMonth() ) {
			return 'warning';
		} else {
			'';
		}
	};

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

	$scope.sections = [
			{
				name: 'Base',
				count: 0
			},
			{
				name: 'Extra',
				count: 0
			}
		];

	$scope.$watch("definition.accounts + movements.month",function(pre,post) {
		if ( $scope.definition.accounts && $scope.movements.month ) {
			$scope.sections[0].count=1;
			$scope.sections[1].count=1;
			for ( var i=0; i<$scope.definition.accounts.length; i++ ) {
				if ( $scope.movements.month[$scope.definition.accounts[i].account] 
						&& $scope.movements.month[$scope.definition.accounts[i].account].value ) {
					$scope.sections[$scope.definition.accounts[i].section].count++;
				}
			}
		}
	});

	$scope.definition = CubeDefinition.get({id:$scope.selected.id});
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

		$scope.movements = Cube.query($scope.selected);
		$scope.definition = CubeDefinition.get({id:$scope.selected.id});

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

    $scope.addNewAccount = function(addAccount,addAccountSection) {
        var def = {
            account: addAccount._id,
            name: addAccount.name,
            width: "70",
            section: addAccountSection
        };
        $scope.definition.accounts.push(def);
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
cashcube.factory('Account',function($resource) {
    return $resource('account',{},{
        query: { method: 'GET', params: {   },isArray:true  }
    });
});
