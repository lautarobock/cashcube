module.exports.findCube = function(items) {
    var results = {};
    for( var i in items) {
        var item = items[i];
        var day = item.date.getDate();

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
