(function() {

	var overview = angular.module("overview", ['ui.bootstrap']);

	overview.run(function($rootScope) {

	});

	var MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio', 'Julio', 'Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
	var DAYS = ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'];

	overview.controller("OverviewController", function($scope, $http) {
		//Month selection
		$scope.selected = null;

    	$scope.months = [];

	    var yearStart = 2014;
	    var monthStart = 10;
	    
	    var today = new Date();
	    var yearEnd = today.getYear()+1900;
	    var monthEnd = today.getMonth()+1;

	    var formatMonth= function(month) {
	        if ( m<10 ) {
	            return '0'+m;
	        } else {
	            return m;
	        }
	    };

	    for ( var y=yearStart; y<=yearEnd; y++ ) {
	        var mEnd = 12;
	        if ( y == yearEnd ) {
	            mEnd = monthEnd;
	        }
	        for ( var m=monthStart; m<=mEnd; m++ ) {
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

	    $scope.$watch("selected", function(month) {
	    	if ( month ) {
				reload();
	    	}
	    });


		$scope.normalize = function(label) {
			if ( label === '_' ) return "N/L";
			return label;
		};
		$scope.hasAccountDetail = function(value) {
			if ( value.total == 0 ) return false;
			var count = 0;
			var name = null;
			for ( var k in value.labels ) {
				name = k;
				count ++;
			}
			return !(count == 1 && name == '_');
		};
		$scope.styleCurrency = function(amount) {
			if ( amount < 0 ) {
				return {color:'red'};
			}
		};
		$scope.showDetails = {};
		$scope.showLabels = {};
		

		$scope.totals = {
			balance: 0,
			prev: 0,
			diff: 0
		}
		function reload() {
			$http.get("/overview/" + $scope.selected.year + "/" + $scope.selected.month).success(function(items) {
				console.log("ITEMS", items);
				$scope.items = items;
			});

			$http.get("/balance/" + $scope.selected.year + "/" + $scope.selected.month).success(function(items) {
				console.log("Balance", items);
				$scope.balance = items;

				for ( var i=0; i<items.length; i++ ) {
					$scope.totals.balance += items[i].actual.credit - items[i].actual.debit;
					$scope.totals.prev += items[i].prev.credit - items[i].prev.debit;
					$scope.totals.diff += items[i].actual.credit - items[i].actual.debit - (items[i].prev.credit - items[i].prev.debit);
				}
			});
		}
	

		
	});

})();