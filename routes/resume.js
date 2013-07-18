/**
 * Created with JetBrains WebStorm.
 * User: lautaro
 * Date: 27/01/13
 * Time: 12:39
 * To change this template use File | Settings | File Templates.
 */

var mongo = require('mongodb');
//var rest = require('../util/rest.js');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var db;

var database= {
    ip:'localhost',
    port:27017,
    name:'cashcube',
    type:'mongodb'
}

var url=require('util').format('mongodb://%s:%d/%s',database.ip,database.port,database.name);
//var url=require('util').format('mongodb://663a9748-776b-4d72-9b91-443da8eeb3c0:e36ef048-0346-460b-aa84-17f96c686ed1@localhost:10000/db');

new Db.connect(url,function(err,nnd){
    db = nnd;
});

function getDaysFrom(from,to) {
    return Math.round((to.getTime() - from.getTime()) / 86400000);
}

module.exports.findGroup = function(req,res,next) {
    db.collection("movement", function(err, collection) {
        var filter = {};

        if ( req.query.fromDate || req.query.toDate ) {
            filter.date={};

            if ( req.query.fromDate ) {
                filter.date['$gte'] = new Date(req.query.fromDate);
            }

            if ( req.query.toDate ) {
                filter.date['$lte'] = new Date(req.query.toDate);
            }
        }

        collection.find(filter).sort({date:1}).toArray(function (err, items) {
//            var results = {};
            var firstDate;
            var week;
            for( var i in items) {
                var item = items[i];
                if (!firstDate) {
                    firstDate = new Date(item.date);
                    week = item.week = 0;
                } else {
                    var actual = Math.round(getDaysFrom(firstDate,new Date(item.date))/7);
                    item.week = actual;
                }
            }
            res.send(items);
        });


    });
}

var m = [
  {
    "date": new Date("2013-07-16T22:00:00.000Z"),
    "description": "Entrada Bichu",
    "amount": 19.3,
    "account": "caixa",
    "accountTarget": "deudas_general",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51e5cba026f5c50208000014"
  },
  {
    "date": new Date("2013-07-16T22:00:00.000Z"),
    "description": "Entrada Bichu",
    "amount": 19,
    "account": "deudas_general",
    "accountTarget": "cash",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51e5cbb426f5c50208000015"
  },
  {
    "date": new Date("2013-07-16T22:00:00.000Z"),
    "description": "O'Toxo Tres Hermanos",
    "amount": 26.85,
    "account": "caixa",
    "accountTarget": "salidas",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51e71dd826f5c50208000018"
  },
  {
    "date": new Date("2013-07-15T22:00:00.000Z"),
    "description": "Aceite",
    "amount": 1.95,
    "account": "cash",
    "accountTarget": "super",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51e5a8c526f5c50208000013"
  },
  {
    "date": new Date("2013-07-15T22:00:00.000Z"),
    "description": "Agua",
    "amount": 1.5,
    "account": "cash",
    "accountTarget": "salidas",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51e5d2a126f5c50208000016"
  },
  {
    "date": new Date("2013-07-15T22:00:00.000Z"),
    "description": "Mel Sandemans",
    "amount": 5,
    "account": "cash",
    "accountTarget": "salidas",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51e5d2b526f5c50208000017"
  },
  {
    "date": new Date("2013-07-14T22:00:00.000Z"),
    "description": "Bar llegada Bichu",
    "amount": 10,
    "account": "cash",
    "accountTarget": "salidas",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51e4ea7b26f5c50208000012"
  },
  {
    "_id": "51e193b226f5c5020800000d",
    "date": new Date("2013-07-12T22:00:00.000Z"),
    "description": "Corte ingles",
    "amount": 4.55,
    "account": "caixa",
    "accountTarget": "super",
    "ref": "ci20130713",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1
  },
  {
    "date": new Date("2013-07-12T22:00:00.000Z"),
    "description": "Fernet",
    "amount": 13.41,
    "account": "caixa",
    "accountTarget": "vicio",
    "ref": "ci20130713",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51e193f426f5c5020800000e"
  },
  {
    "date": new Date("2013-07-12T22:00:00.000Z"),
    "description": "Perfumeria Corte ingles",
    "amount": 6.29,
    "account": "caixa",
    "accountTarget": "super",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51e1946126f5c5020800000f"
  },
  {
    "date": new Date("2013-07-12T22:00:00.000Z"),
    "description": "Salida con Mati",
    "amount": 4.5,
    "account": "cash",
    "accountTarget": "salidas",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51e2ccfa26f5c50208000010"
  },
  {
    "_id": "51dff0c426f5c50208000009",
    "date": new Date("2013-07-11T22:00:00.000Z"),
    "description": "Panepot 2012 y Gouden Carolus Classic",
    "amount": 6,
    "account": "caixa",
    "accountTarget": "vicio",
    "ref": "",
    "tags": "birra",
    "accountCurrency": 1,
    "accountTargetCurrency": 1
  },
  {
    "date": new Date("2013-07-11T22:00:00.000Z"),
    "description": "Extraccion Cajero",
    "amount": 90,
    "account": "caixa",
    "accountTarget": "cash",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51dff0d626f5c5020800000a"
  },
  {
    "date": new Date("2013-07-11T22:00:00.000Z"),
    "description": "Boqueria",
    "amount": 12.75,
    "account": "cash",
    "accountTarget": "super",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51e1934326f5c5020800000b"
  },
  {
    "date": new Date("2013-07-11T22:00:00.000Z"),
    "description": "Salida Scytl",
    "amount": 8.75,
    "account": "cash",
    "accountTarget": "salidas",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51e1936926f5c5020800000c"
  },
  {
    "date": new Date("2013-07-11T22:00:00.000Z"),
    "description": "Cuota Poliza Tarjeta Credito",
    "amount": 39.57,
    "account": "caixa",
    "accountTarget": "fijos",
    "ref": "POL: 2013.6098.4000056608",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51e420be26f5c50208000011"
  },
  {
    "date": new Date("2013-07-10T22:00:00.000Z"),
    "description": "Carrefour",
    "amount": 67.27,
    "account": "caixa",
    "accountTarget": "super",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51dfa9cc26f5c50208000007"
  },
  {
    "date": new Date("2013-07-10T22:00:00.000Z"),
    "description": "Puchos",
    "amount": 6.6,
    "account": "cash",
    "accountTarget": "vicio",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51dfa9dc26f5c50208000008"
  },
  {
    "date": new Date("2013-07-09T22:00:00.000Z"),
    "description": "Transferencia interna",
    "amount": 25.25,
    "account": "debito_comafi",
    "accountTarget": "debito_rio",
    "ref": "",
    "tags": "",
    "accountCurrency": 6.92,
    "accountTargetCurrency": 6.92,
    "_id": "51dd018526f5c50208000001"
  },
  {
    "date": new Date("2013-07-09T22:00:00.000Z"),
    "description": "Vuelo BCN-Zurich",
    "amount": 246.14,
    "account": "caixa",
    "accountTarget": "viajes",
    "ref": "TRAVELGENIO S.L.",
    "tags": "Selva Negra, Avion",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51dd33b426f5c50208000002"
  },
  {
    "date": new Date("2013-07-09T22:00:00.000Z"),
    "description": "Vuelo Berlin-BCN",
    "amount": 361.37,
    "account": "caixa",
    "accountTarget": "viajes",
    "ref": "RUMBO-RED UNIVERS ",
    "tags": "Selva Negra, Avion",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51dd347926f5c50208000003"
  },
  {
    "date": new Date("2013-07-09T22:00:00.000Z"),
    "description": "Extraccion Cajero",
    "amount": 40,
    "account": "caixa",
    "accountTarget": "cash",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51dd451a26f5c50208000004"
  },
  {
    "date": new Date("2013-07-09T22:00:00.000Z"),
    "description": "Alquiler Auto Alemania",
    "amount": 212.03,
    "account": "caixa",
    "accountTarget": "viajes",
    "ref": "",
    "tags": "Selva Negra, Auto",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51dd52b426f5c50208000005"
  },
  {
    "_id": "51de7c4b26f5c50208000006",
    "date": new Date("2013-07-09T22:00:00.000Z"),
    "description": "Bicing",
    "amount": 2.92,
    "account": "caixa",
    "accountTarget": "salidas",
    "ref": "",
    "tags": "bicing",
    "accountCurrency": 1,
    "accountTargetCurrency": 1
  },
  {
    "_id": "51dc5d1f7f27fd6439000005",
    "date": new Date("2013-07-08T22:00:00.000Z"),
    "description": "Dia + Chino",
    "amount": 12.95,
    "account": "cash",
    "accountTarget": "super",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1
  },
  {
    "date": new Date("2013-07-07T22:00:00.000Z"),
    "description": "Birras catalanas",
    "amount": 2.6,
    "account": "cash",
    "accountTarget": "vicio",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51db055d04be48f0200000ab"
  },
  {
    "date": new Date("2013-07-07T22:00:00.000Z"),
    "description": "Puchos",
    "amount": 3.4,
    "account": "cash",
    "accountTarget": "vicio",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51db056d04be48f0200000ac"
  },
  {
    "date": new Date("2013-07-07T22:00:00.000Z"),
    "description": "Bicing",
    "amount": 0.73,
    "account": "caixa",
    "accountTarget": "salidas",
    "ref": "",
    "tags": "bicing",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51dc40397f27fd6439000004"
  },
  {
    "_id": "51da550f04be48f0200000aa",
    "date": new Date("2013-07-06T22:00:00.000Z"),
    "description": "Sitges",
    "amount": 44,
    "account": "cash",
    "accountTarget": "salidas",
    "ref": "",
    "tags": "Sitges",
    "accountCurrency": 1,
    "accountTargetCurrency": 1
  },
  {
    "date": new Date("2013-07-05T22:00:00.000Z"),
    "description": "Boqueria",
    "amount": 12.2,
    "account": "cash",
    "accountTarget": "super",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51d851cf04be48f0200000a9"
  },
  {
    "date": new Date("2013-07-04T22:00:00.000Z"),
    "description": "Regalo Nico",
    "amount": 22.95,
    "account": "cash",
    "accountTarget": "bonus",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51d701fc04be48f0200000a8"
  },
  {
    "_id": "51dc40197f27fd6439000003",
    "date": new Date("2013-07-04T22:00:00.000Z"),
    "description": "Bicing",
    "amount": 0.73,
    "account": "caixa",
    "accountTarget": "salidas",
    "ref": "",
    "tags": "bicing",
    "accountCurrency": 1,
    "accountTargetCurrency": 1
  },
  {
    "date": new Date("2013-07-03T22:00:00.000Z"),
    "description": "Carre",
    "amount": 46.78,
    "account": "caixa",
    "accountTarget": "super",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51d5cd4304be48f0200000a7"
  },
  {
    "_id": "51dc3fec7f27fd6439000002",
    "date": new Date("2013-07-03T22:00:00.000Z"),
    "description": "Bicing",
    "amount": 1.46,
    "account": "caixa",
    "accountTarget": "salidas",
    "ref": "",
    "tags": "bicing",
    "accountCurrency": 1,
    "accountTargetCurrency": 1
  },
  {
    "date": new Date("2013-07-02T22:00:00.000Z"),
    "description": "Desayuno analisis",
    "amount": 1.65,
    "account": "cash",
    "accountTarget": "super",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51d3dcbf04be48f0200000a3"
  },
  {
    "date": new Date("2013-07-02T22:00:00.000Z"),
    "description": "Puchos",
    "amount": 4.25,
    "account": "cash",
    "accountTarget": "vicio",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51d4c55704be48f0200000a5"
  },
  {
    "date": new Date("2013-07-02T22:00:00.000Z"),
    "description": "Queso y galles masticarla",
    "amount": 10.6,
    "account": "cash",
    "accountTarget": "bonus",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51d4c5a004be48f0200000a6"
  },
  {
    "_id": "51d4c4fa04be48f0200000a4",
    "date": new Date("2013-07-02T22:00:00.000Z"),
    "description": "Rochefort 8",
    "amount": 2.9,
    "account": "birra",
    "accountTarget": "vicio",
    "ref": "",
    "tags": "Birra",
    "accountCurrency": 1,
    "accountTargetCurrency": 1
  },
  {
    "date": new Date("2013-07-01T22:00:00.000Z"),
    "description": "Alioli masticarla",
    "amount": 0.8,
    "account": "cash",
    "accountTarget": "bonus",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51d34bb104be48f0200000a1"
  },
  {
    "date": new Date("2013-07-01T22:00:00.000Z"),
    "description": "Ventilador",
    "amount": 31.6,
    "account": "cash",
    "accountTarget": "bonus",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51d34bc104be48f0200000a2"
  },
  {
    "date": new Date("2013-07-01T22:00:00.000Z"),
    "description": "Birras",
    "amount": 5.1,
    "account": "cash",
    "accountTarget": "vicio",
    "ref": "",
    "tags": "Birra",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51d34b9f04be48f0200000a0"
  },
  {
    "_id": "51dc3f787f27fd6439000001",
    "date": new Date("2013-07-01T22:00:00.000Z"),
    "description": "Alquiler",
    "amount": 521.5,
    "account": "caixa",
    "accountTarget": "fijos",
    "ref": "",
    "tags": "alquiler",
    "accountCurrency": 1,
    "accountTargetCurrency": 1
  },
  {
    "date": new Date("2013-06-30T22:00:00.000Z"),
    "description": "Beerbox Mati",
    "amount": 3.9,
    "account": "caixa",
    "accountTarget": "bonus",
    "ref": "beerbox_001",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51d149b104be48f02000009d"
  },
  {
    "date": new Date("2013-06-30T22:00:00.000Z"),
    "description": "Dia",
    "amount": 3.19,
    "account": "cash",
    "accountTarget": "super",
    "ref": "",
    "tags": "",
    "accountCurrency": 1,
    "accountTargetCurrency": 1,
    "_id": "51d2080904be48f02000009e"
  },
  {
    "_id": "51d1499b04be48f02000009c",
    "date": new Date("2013-06-30T22:00:00.000Z"),
    "description": "Beerbox",
    "amount": 6,
    "account": "caixa",
    "accountTarget": "vicio",
    "ref": "beerbox_001",
    "tags": "Birra",
    "accountCurrency": 1,
    "accountTargetCurrency": 1
  }
];

module.exports.findCube = function(req,res,next) {
//    db.collection("movement", function(err, collection) {
        var filter = {};


        filter.date={};

        filter.date['$gte'] = new Date(req.query.year,req.query.month-1,1)
        var to = new Date(req.query.year,req.query.month,1);

        filter.date['$lt'] = to;

//        collection.find(filter).sort({date:1}).toArray(function (err, items) {
            var results = {};
            for( var i in m) {
                var item = m[i];
                var day = item.date.getDate();
                if ( day < 10 ) {
                    day = "0" + day;
                }
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
            res.send(results);
  //      });


  //  });
}

module.exports.findAll = function(req,res,next) {
    db.collection("movement", function(err, collection) {
        var filter = {};

        if ( req.query.fromDate || req.query.toDate ) {
            filter.date={};

            if ( req.query.fromDate ) {
                filter.date['$gte'] = new Date(req.query.fromDate);
            }

            if ( req.query.toDate ) {
                filter.date['$lte'] = new Date(req.query.toDate);
            }
        }




        function doFind(accounts) {
            collection.find(filter).sort({_id:1}).toArray(function (err, items) {
                var accountsMap = {};
                for (var i in items) {
                    var item = items[i];
                    if ( !accounts || accounts.indexOf(item.account)>-1 ) {
                        if ( !accountsMap[item.account]) {
                            var account = {
                                account:item.account,
                                credit:item.amount,
                                amount:item.amount,
                                debit:0
                            };
                            accountsMap[item.account] = account;
                        } else {
                            accountsMap[item.account].credit += item.amount;
                            accountsMap[item.account].amount += item.amount;
                        }
                    }
                    if ( !accounts || accounts.indexOf(item.accountTarget)>-1 ) {
                        if (!accountsMap[item.accountTarget]) {
                            var account = {
                                account:item.accountTarget,
                                debit:item.amount,
                                amount:-item.amount,
                                credit:0
                            };
                            accountsMap[item.accountTarget] = account;
                        } else {
                            accountsMap[item.accountTarget].debit += item.amount;
                            accountsMap[item.accountTarget].amount -= item.amount;
                        }
                    }

                }
                var results = [];
                for (var a in accountsMap) {
                    accountsMap[a].amount = Math.round(accountsMap[a].amount);
                    accountsMap[a].credit = Math.round(accountsMap[a].credit);
                    accountsMap[a].debit = Math.round(accountsMap[a].debit);
                    results.push(accountsMap[a]);
                }
                res.send(results);
            });
        }
        if ( req.query.category ) {
            //TODO, filtrar todas las cuentas que sean de la categoria buscada.
            db.collection("account", function(err, collection) {
                collection.find({category:req.query.category}).toArray(function (err, items) {
                    var accounts = [];
                    for ( var i in items ) {
                        accounts.push(items[i]._id);
                    }
//                    filter.account = {$in:accounts};
                    filter.$or = [
                        { account:{$in:accounts} },
                        { accountTarget:{$in:accounts} }
                    ];
                    doFind(accounts);
                });
            });

        } else {
            doFind();
        }

    });
}

