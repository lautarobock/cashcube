var util = require("../public/js/util.js");

module.exports.findCube = function(items) {
    var results = {
        days: {},
        weeks: {},
        month: {}
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



        /*
         for accoutTarget
         */
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
    }
    return results;
}
