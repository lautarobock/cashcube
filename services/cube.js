module.exports.findCube = function(items) {
    var results = {};
	/*
	for ( var day=1; day<31; day++ ) {
		results[new Date(113,6,day).toString()] = {};
	}*/
    for( var i in items) {
        var item = items[i];
        var day = item.date.toUTCString();

        if ( !results[day] ) {
            results[day] = {};
        }
        if ( !results[day][item.account] ) {
            results[day][item.account] = item.amount;
        } else {
            results[day][item.account] += item.amount;
        }

        if ( !results[day][item.accountTarget] ) {
            results[day][item.accountTarget] = -item.amount;
        } else {
            results[day][item.accountTarget] -= item.amount;
        }
    }
    return results;
}
