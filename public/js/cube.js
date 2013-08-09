
var cashcube = angular.module('cashcube',['ngResource','ui.bootstrap']);


cashcube.filter("valueFilter",function() {
    return function(value,max) {
        if ( !value ) return '';
        var result = (-value).toString();
        if ( angular.isDefined(max) && max != null ) {
            result += ' ('+max+')';
        }
        return result;
    };
});


function sectionFilter(accounts,section,movements) {
    if ( !accounts || !movements.month ) return accounts;
    var filtered = [];
    for ( var i=0; i<accounts.length; i++ ) {
        if ( accounts[i].section === section && movements.month[accounts[i].account] && movements.month[accounts[i].account].value) {
            filtered.push(accounts[i]);
        }
    }
    return filtered;
}

cashcube.filter('sectionFilter',function() {
    return sectionFilter;
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

    $scope.lastWeek = function() {
        return r[r.length-1].week;
    };

    $scope.maxValue = function(week,values) {
        if ( !week || !values) return null;
        if ( week.week === 1 ) {
            if ( !angular.isDefined(values.max1Week) || values.max1Week === null) {
                return values.maxWeek;
            } else {
                return values.max1Week;
            }
        } else if ( week.week === $scope.lastWeek() ) {
            if ( !angular.isDefined(values.maxLWeek) || values.maxLWeek === null) {
                return values.maxWeek;
            } else {
                return values.maxLWeek;
            }
        } else {
            return values.maxWeek;
        }
    };


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
	
	$scope.modified = {};
	$scope.setModified = function(account,key) {
		if (!$scope.modified[account]) {
			$scope.modified[account] = {};
		}
		$scope.modified[account][key] = true;
	};
	
	
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
		if ( $scope.selected.year !== yearEnd || $scope.selected.month !== monthEnd || $scope.alldays) return r;
		var res = [];
		var helper = new util.WeekHelper($scope.selected.year,$scope.selected.month-1,4);
		var week = helper.getWeek(new Date().getDate());
		for(var i=0;i<r.length; i++ ) {
			if ( r[i].week <= week ) res.push(r[i]);
		}
        return res;
    };

    $scope.days = function (from,to) {
        var days = [];
        for(var i=from; i<=to; i++) {
            var d = i;
            days.push(d);
        }
        return days;
    };

    $scope.forecastTotal = function(accounts,movements) {
        var value = 0;
        for ( var i=0; i<2; i++ ) {
            value += $scope.forecastForSection(i,accounts,movements);
        }
        return value;
    };

    $scope.forecastForSection = function(section,accounts,movements) {
        var value = 0;
        angular.forEach(sectionFilter(accounts,section,movements),function(def) {
            value += $scope.forecastVal(def)||0;
        });
        return value;
    };

    $scope.forecast = function(definition) {
        var value = $scope.forecastVal(definition);
        if ( value ) {
            return value.toFixed(2);
        } else {
            return '--';
        }
    }

	$scope.forecastVal = function(definition) {
		if ( $scope.selected.year !== yearEnd || $scope.selected.month !== monthEnd ) return null;
		if ( !$scope.movements.month ) return null;
		if ( definition.projection === 'week' ) {
			var value = 0;
			// lo ya gastado
			value -= $scope.movements.month[definition.account].value;
			var helper = new util.WeekHelper($scope.selected.year,$scope.selected.month-1,$scope.definition.startDow);
			var week = helper.getWeek(new Date().getDate());

			//el resto de la semana
			var max = $scope.maxValue(r[week-1],definition);
			
			var resto;
			if ( $scope.movements.weeks[week] && $scope.movements.weeks[week][definition.account]) {
				resto = max + $scope.movements.weeks[week][definition.account].value;	
			} else {
				resto = max;
			}
			if ( resto > 0 ) {
				value += resto;
			}
			var last = $scope.lastWeek();
			for ( var i=week+1; i<=last ; i++ ) {
				if ( i === last ) {
					value += $scope.maxValue(r[i-1],definition)
				} else {
					value += definition.maxWeek;
				}
			}
			return value;
		} if ( definition.projection === 'month' ) {
			var value = -$scope.movements.month[definition.account].value;
			
			var max = definition.maxMonth;

			return Math.max(value,max);
		} else {
			return -$scope.movements.month[definition.account].value;
		}
	};

    $scope.getClassForWeek = function(week,account) {
        if ( !$scope.movements.weeks ) return '';
		if ( !$scope.movements.weeks[week.week] ) return '';
		if ( !$scope.movements.weeks[week.week][account.account] ) return '';
		var value = $scope.movements.weeks[week.week][account.account].value;
        if ( !value  ) return '';

        var maxValue = $scope.maxValue(week,account);
        if ( !angular.isDefined(maxValue) || maxValue === null ) {
            return 'text-success';
        } else if ( -value > maxValue) {
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
        return 'alert alert-success';
    };

    $scope.getClass = function(value,account) {
        if ( !value  ) return '';
		if ( account.maxDay && -value > account.maxDay ) return 'text-error';
        return 'text-success';
    };

	$scope.getClassForSaving = function(value) {
		if ( value < 0 ) return 'text-error';
		if ( value > 0 ) return 'text-success';
		return 'text-info';
	};

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

	$scope.projectionTypes = ['week','month'];

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
