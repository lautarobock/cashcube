var util = require("../public/js/util.js");
var resource = require("../test/resources.js");

//module.exports.findDefinition = function(id) {
//    return resource.cubedefinition[0];
//};

function contains(def,accountid) {
    for ( var i=0; i<def.accounts.length; i++ ) {
        if  ( def.accounts[i].account === accountid ) {
            return def.accounts[i];
        }
    }
    return null;
}

module.exports.findCube = function(items,def) {
    var results = {
        days: {},
        totalDay: {},
        weeks: {},
        totalWeek: {},
        month: {},
        totalSection: [0,0],
        total: 0
    };

    for( var i in items) {
        var item = items[i];
        var day = item.date;
        /*
         * Esto es para salvar el problema del cambio a UTC, de todas formas
         * siempre pongo las fechas con la misma hora, esta utlima no se usa.
         */
        day.setHours(day.getHours()+5);
        day = day.getDate();
        var week = util.getWeek(day);

        if ( !results.days[day] ) {
            results.days[day] = {};
        }
        if ( !results.weeks[week] ) {
            results.weeks[week] = {};
        }

        /*
        for accout
         */
        var defAccount = contains(def,item.account);
        if ( defAccount ) {
            if ( !results.days[day][item.account] ) {
                results.days[day][item.account] = {
                    value: item.amount,
                    items: [item]
                };
            } else {
                results.days[day][item.account].value += item.amount;
                results.days[day][item.account].items.push(item);

            }
            if ( !results.weeks[week][item.account] ) {
                results.weeks[week][item.account] = {
                    value: item.amount
                };
            } else {
                results.weeks[week][item.account].value += item.amount;
            }
            if ( !results.month[item.account] ) {
                results.month[item.account] = {
                    value: item.amount
                };
            } else {
                results.month[item.account].value += item.amount;
            }
            if (!results.totalDay[day]) {
                results.totalDay[day] = item.amount;
            } else {
                results.totalDay[day] += item.amount;
            }
            if (!results.totalWeek[week]) {
                results.totalWeek[week] = item.amount;
            } else {
                results.totalWeek[week] += item.amount;
            }
            results.total += item.amount;
            results.totalSection[defAccount.section] += item.amount;
        }


        /*
         for accoutTarget
         */
        var defAccountTarget = contains(def,item.accountTarget);
        if ( defAccountTarget ) {
            if ( !results.days[day][item.accountTarget] ) {
                results.days[day][item.accountTarget] = {
                    value: -item.amount,
                    items: [item]
                };
            } else {
                results.days[day][item.accountTarget].value -= item.amount;
                results.days[day][item.accountTarget].items.push(item);
            }

            if ( !results.weeks[week][item.accountTarget] ) {
                results.weeks[week][item.accountTarget] = {
                    value: -item.amount
                };
            } else {
                results.weeks[week][item.accountTarget].value -= item.amount;
            }

            if ( !results.month[item.accountTarget] ) {
                results.month[item.accountTarget] = {
                    value: -item.amount
                };
            } else {
                results.month[item.accountTarget].value -= item.amount;
            }
            if (!results.totalDay[day]) {
                results.totalDay[day] = -item.amount;
            } else {
                results.totalDay[day] -= item.amount;
            }
            if (!results.totalWeek[week]) {
                results.totalWeek[week] = -item.amount;
            } else {
                results.totalWeek[week] -= item.amount;
            }
            results.total -= item.amount;
            results.totalSection[defAccountTarget.section] -= item.amount;
        }
    }
    return results;
}
