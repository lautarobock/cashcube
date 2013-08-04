
var cashcube = angular.module('cashcube',['ngResource','ui.bootstrap']);

cashcube.config(function($httpProvider) {


//    $httpProvider.responseInterceptors.push(function($rootScope) {
//        $rootScope.loading = true;
//        return function(promise) {
//            return promise.then(function(response){
//                $rootScope.loading = false;
//                return response;
//            });
//        }
//    });
});

cashcube.filter("valueFilter",function() {
    return function(value,max) {
        if ( !value ) return '';
        return -value + (max?' ('+max+')':'');
    };
});

cashcube.filter('sectionFilter',function() {
    return function(accounts,section,movements) {
    if ( !accounts || !movements.month ) return accounts;
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


cashcube.controller("ProjectionController", function($scope,Cube,CubeDefinition,Account,$rootScope) {

    $rootScope.loading = false;
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
			return '';
		}
	};

    $scope.selected = null;

    $scope.months = [];

    var yearStart = 2013;
    var monthStart = 1;

    var today = new Date();
    var yearEnd = today.getYear()+1900;
    var monthEnd = today.getMonth()+1;

    var r = new util.WeekHelper(yearEnd,monthEnd-1,4).getAllWeeks();

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

        r = new util.WeekHelper(month.year,month.month-1,4).getAllWeeks();

        $rootScope.loading = 2;

        $scope.definition = CubeDefinition.get({id:$scope.selected.id},function(){
            $rootScope.loading--;
        });
        $scope.movements = Cube.query($scope.selected,function() {
            $rootScope.loading--;
        });
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

    $scope.getClassForWeek = function(week,account) {
        if ( !$scope.movements.weeks ) return '';
		if ( !$scope.movements.weeks[week] ) return '';
		if ( !$scope.movements.weeks[week][account.account] ) return '';
		var value = $scope.movements.weeks[week][account.account].value;
        if ( !value  ) return '';
        if ( week === 1 && account.max1Week && -value > account.max1Week ) {
            return 'text-error';
        } else if ( week === 1 && account.maxWeek && -value > account.maxWeek ) {
            return 'text-error';
        } else if ( week !== 1 && account.maxWeek && -value > account.maxWeek ) {
            return 'text-error';
        } else {
            return 'text-success';
        }
    };

    $scope.getClassForTotal = function(value,account) {
        if ( !value  ) return '';
        if ( account.maxMonth ) {
			var max = account.maxMonth - (account.trail||0);
			if ( -value > max ) {
				return 'alert alert-error';
			}
		}		
//        if ( account.maxMonth && -value > account.maxMonth ) return 'alert alert-error';
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
        $rootScope.loading = 1;
        $scope.definition.$save(function(){
            $rootScope.loading--;
        });
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
    
    $scope.definitionOptions = [{
	    caption: 'Mx/dia',
	    key: 'maxDay'
    }, {
        caption: 'Semana 1',
        key: 'max1Week'
    }, {
        caption: 'Ultima S.',
        key: 'maxLWeek'
    }, {
	    caption: 'Mx/sem',
	    key: 'maxWeek'
	}, {
	    caption: 'Mx/mes',
	    key: 'maxMonth'
	}, {
	    caption: 'Seccion',
	    key: 'section'
	}];

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
