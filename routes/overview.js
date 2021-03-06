var mongo = require('mongodb');
//var rest = require('../util/rest.js');
var cube = require("../services/cube.js");
var db = require("../util/db");
var MongoClient = require('mongodb').MongoClient;

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var db;

var database= db.config;

var url=require('util').format(database.url);
//var url=require('util').format('mongodb://663a9748-776b-4d72-9b91-443da8eeb3c0:e36ef048-0346-460b-aa84-17f96c686ed1@localhost:10000/db');

MongoClient.connect(url).then(nnd => {
    db = nnd.db();
});

/**
* Balance meensual por cada cuenta (y comparacion con el mes anterior)
*/
module.exports.findBalance = function(req, res) {
	var balance = {
		cash: {debit:0, credit:0, category: 'Cash',style:'danger'},
		cash_dolar: {debit:0, credit:0, category: 'Cash',style:'danger'},
        cash_pound: {debit:0, credit:0, category: 'Cash',style:'danger'},
		cash_peso: {debit:0, credit:0, category: 'Cash',style:'info'},
		debito_rio: {debit:0, credit:0, category: 'Cuentas',style:'active'},
        mp: {debit:0, credit:0, category: 'Cuentas',style:'active'},
        brubank: {debit:0, credit:0, category: 'Cuentas',style:'active'},
		evo: {debit:0, credit:0, category: 'Cuentas',style:'danger'},
        uy: {debit:0, credit:0, category: 'Cuentas',style:'info'},
		// paypal: {debit:0, credit:0, category: 'Cuentas',style:'active'},
		credito_rio: {debit:0, credit:0, category: 'Tarjeta',style:'info'},
		// tarjeta_cencosud: {debit:0, credit:0, category: 'Tarjeta',style:'info'},
        // tarjeta_evo: {debit:0, credit:0, category: 'Tarjeta',style:'danger'},
        credito_uy: {debit:0, credit:0, category: 'Tarjeta',style:'danger'},
		//tarjeta_mel: {debit:0, credit:0, category: 'Tarjeta',style:'info'},
		deudas_general: {debit:0, credit:0, category: 'Otros',style:'active'},
		polo: {debit:0, credit:0, category: 'Otros',style:'warning'},
        // tarjeta_galicia: {debit:0, credit:0, category: 'Tarjeta',style:'info'},
        // galicia_debito: {debit:0, credit:0, category: 'Cuentas',style:'info'},
        payoneer: {debit:0, credit:0, category: 'Cuentas',style:'info'},
        crypto: {debit:0, credit:0, category: 'Cuentas',style:'info'},
//         payoneer_mel: {debit:0, credit:0, category: 'Cuentas',style:'active'},
        amex: {debit:0, credit:0, category: 'Tarjeta',style:'danger'}
	};

	var m = req.params.month;
    if ( m<10) m='0'+m;
    var def_id = req.params.year+m;

	db.collection("movement", function(err, collection) {
        var filter = {};

        filter.date={};

        //-2 is added to fix UTC change time. (ugly)
        filter.date['$lt'] = new Date(req.params.year,req.params.month-1,1);
        filter.date['$lt'].setHours(filter.date['$lt'].getHours()-2);

        var filterAct = { date: {}};
        //-2 is added to fix UTC change time. (ugly)
        filterAct.date['$lt'] = new Date(req.params.year,req.params.month,1);
        filterAct.date['$lt'].setHours(filterAct.date['$lt'].getHours()-2);


        console.log("FILTER", filter);
        console.log("FILTER ACT", filterAct);

        // console.log("FILTER", filter);
        var group = [{$match: filterAct},{$group: {_id:"$account", total: {$sum: '$amount'}}}];
        var groupTarget = [{$match: filterAct},{$group: {_id:"$accountTarget", total: {$sum: '$amount'}}}];
        var prevGroup = [{$match: filter}, {$group: {_id:"$account", total: {$sum: '$amount'}}}];
        var prevGroupTarget = [{$match: filter}, {$group: {_id:"$accountTarget", total: {$sum: '$amount'}}}];

        Promise.all([
            collection.aggregate(group).forEach(item => {
                if ( balance[item._id] ) {
                    balance[item._id].debit = item.total;
                }
            }),
            collection.aggregate(groupTarget).forEach(item => {
                if ( balance[item._id] ) {
                    balance[item._id].credit = item.total;
                }
            }),
            collection.aggregate(prevGroup).forEach(item => {
                if ( balance[item._id] ) {
                    balance[item._id].prevDebit = item.total;
                }
            }),
            collection.aggregate(prevGroupTarget).forEach(item => {
                if ( balance[item._id] ) {
                    balance[item._id].prevCredit = item.total;
                }
            })
        ]).then(() => {
            var result = [];
            for ( var k in balance ) {
                result.push({
                    account_id: k,
                    category: balance[k].category,
                    style: balance[k].style,
                    actual: {
                        debit: balance[k].debit,
                        credit: balance[k].credit
                    },
                    prev: {
                        debit: balance[k].prevDebit,
                        credit: balance[k].prevCredit
                    }
                });
            }

            res.send(result);
        });
    });
};

/**
* Cuadro superior con gastos mensuales por cada cuenta
*/
module.exports.find = function(req,res,next) {

    var m = req.params.month;
    if ( m<10) m='0'+m;
    var def_id = req.params.year+m;

    db.collection("movement", function(err, collection) {
        var filter = {};

        filter.date={};

        //-2 is added to fix UTC change time. (ugly)
        filter.date['$gte'] = new Date(req.params.year,req.params.month-1,1);
        filter.date['$gte'].setHours(filter.date['$gte'].getHours()-2);
        var to = new Date(req.params.year,req.params.month,1);
        to.setHours(to.getHours()-2);

        filter.date['$lt'] = to;
        console.log("FILTER OVERVIEW", filter);
        collection.find(filter).sort({date:1}).toArray(function (err, items) {
        	console.log("Items", err);
            var expenses = findOverview(items, newAccounts(EXPENSES_ACCOUNTS), req.query.includeAjuste == 'true');
            var incomes = findOverviewIncomes(items, newAccounts(INCOMES_ACCOUNTS));
            res.send({
                expenses: expenses,
                incomes: incomes
            });
        });


    });
};


function findOverview(items, expenses, includeAjuste) {

	if ( !includeAjuste ) {
		delete expenses.ajuste;
        delete expenses.comisiones;
	}

	var total = 0;
	for( var i=0; i<items.length; i++ ) {
		var item = items[i];
		for( var k in expenses ) {
			if ( item.accountTarget == k ) {
				total += item.amount;
				//Expense in account
				var expense = expenses[k];
				expense.total += item.amount *  item.accountTargetCurrency; //Valor en la moneda destino (la de la cuenta)
                expense.totalEuros += item.amount;
                if ( expense.currencies.indexOf(item.accountTargetCurrency) === -1 ) {
                    expense.currencies.push(item.accountTargetCurrency);
                }
				labels = expense.labels;
				if ( item.tags && item.tags.length != 0 ) {
					//Remove
					var show =false;
					if ( item.tags.indexOf("auto") != -1 ) {
						//console.log("AUTO TAG:", item.description, item.tags, labels);
						show=true;
					}
					for ( var j=0; j<item.tags.length; j++ ) {
						var tag = item.tags[j];
						//REMOVE
						// if ( show ) console.log("TAG: ", tag, labels[tag], !labels[tag]?true:false);
						if ( !labels[tag] ) {
							labels[tag] = {
								total: 0,
                                totalEuros: 0
							}
							// if ( show ) console.log("ACTUAL:", labels);
						}
						labels[tag].total += item.amount *  item.accountTargetCurrency; //Valor en la moneda destino (la de la cuenta)
                        labels[tag].totalEuros += item.amount;

						if ( j<item.tags.length-1 ) {
							if ( !labels[tag].labels ) {
								labels[tag].labels = {

								};
							}
							// if ( show ) console.log("PRE:", labels[tag]);
							labels = labels[tag].labels;
							// if ( show ) console.log("POST:", labels);
						}

					}
				} else {
					var tag = "_";
					if ( !labels[tag] ) {
						labels[tag] = {
							total: 0,
                            totalEuros: 0
						}
					}
					labels[tag].total += item.amount *  item.accountTargetCurrency; //Valor en la moneda destino (la de la cuenta)
                    labels[tag].totalEuros += item.amount;
				}

			}
		}

	}
	return {
		items: expenses,
		total: total
	};
}

function findOverviewIncomes(items, expenses) {

    var total = 0;
    for( var i=0; i<items.length; i++ ) {
        var item = items[i];
        for( var k in expenses ) {
            if ( item.account == k ) {
                total += item.amount;
                //Expense in account
                var expense = expenses[k];
                expense.total += item.amount *  item.accountCurrency; //Valor en la moneda destino (la de la cuenta)
                expense.totalEuros += item.amount;
                if ( expense.currencies.indexOf(item.accountCurrency) === -1 ) {
                    expense.currencies.push(item.accountCurrency);
                }
                labels = expense.labels;
                if ( item.tags && item.tags.length != 0 ) {
                    //Remove
                    var show =false;
                    if ( item.tags.indexOf("auto") != -1 ) {
                        //console.log("AUTO TAG:", item.description, item.tags, labels);
                        show=true;
                    }
                    for ( var j=0; j<item.tags.length; j++ ) {
                        var tag = item.tags[j];
                        //REMOVE
                        // if ( show ) console.log("TAG: ", tag, labels[tag], !labels[tag]?true:false);
                        if ( !labels[tag] ) {
                            labels[tag] = {
                                total: 0,
                                totalEuros: 0
                            }
                            // if ( show ) console.log("ACTUAL:", labels);
                        }
                        labels[tag].total += item.amount *  item.accountCurrency; //Valor en la moneda destino (la de la cuenta)
                        labels[tag].totalEuros += item.amount;

                        if ( j<item.tags.length-1 ) {
                            if ( !labels[tag].labels ) {
                                labels[tag].labels = {

                                };
                            }
                            // if ( show ) console.log("PRE:", labels[tag]);
                            labels = labels[tag].labels;
                            // if ( show ) console.log("POST:", labels);
                        }

                    }
                } else {
                    var tag = "_";
                    if ( !labels[tag] ) {
                        labels[tag] = {
                            total: 0,
                            totalEuros: 0
                        }
                    }
                    labels[tag].total += item.amount *  item.accountCurrency; //Valor en la moneda destino (la de la cuenta)
                    labels[tag].totalEuros += item.amount;
                }

            }
        }

    }
    return {
        items: expenses,
        total: total
    };
}

var INCOMES_ACCOUNTS = [{
    name: 'scytl',
    sign: '€'
},{
    name: 'palantir',
    sign: 'U$S'
},{
    name: 'ifn',
    sign: 'AR$'
},{
    name: 'boli',
    sign: 'AR$'
},{
    name: 'dmx',
    sign: 'AR$'
},{
    name: 'ingreso_varios',
    sign: 'AR$'
},{
    name: 'hacienda',
    sign: '€'
},{
    name: 'teamed',
    sign: 'U$S'
},{
    name: 'cuencos',
    sign: 'AR$'
}];

var EXPENSES_ACCOUNTS = [{
    name: 'bonus',
    sign: 'AR$',
    max: 300
},{
    name: 'extra',
    sign: 'AR$',
    max: 0
},{
    name: 'fijos',
    sign: 'AR$',
    max: 1500
},{
    name: 'salidas',
    sign: 'AR$',
    max: 150
},{
    name: 'super',
    sign: 'AR$',
    max: 375
},{
    name: 'viajes',
    sign: 'AR$',
    max: 0
},{
    name: 'vicio',
    sign: 'AR$',
    max: 130
},{
    name: 'comisiones',
    sign: 'AR$',
    max: 100
},{
    name: 'ajuste',
    sign: 'AR$',
    max: 0
},{
    name: 'bonus',
    sign: 'AR$',
    max: 300
},{
    name: 'casa',
    sign: 'US$',
    max: 0
},{
    name: 'cuencos',
    sign: 'AR$',
    max: 0
}];

exports.incomes = function(req,res) {
    res.send(INCOMES_ACCOUNTS);
};

exports.expenses = function(req,res) {
    res.send(EXPENSES_ACCOUNTS);
};

exports.EXPENSES_ACCOUNTS = EXPENSES_ACCOUNTS;

function newAccounts(model) {
    var accounts = {};

    for ( var i=0; i<model.length; i++ ) {
        accounts[model[i].name] = {
            sign: model[i].sign,
            max: model[i].max||0,
            currencies: [],
            total: 0,
            totalEuros: 0,
            labels: {

            }
        };
    }

    return accounts;
}
