/**
 * Created with JetBrains WebStorm.
 * User: lautaro
 * Date: 10/02/13
 * Time: 13:47
 * To change this template use File | Settings | File Templates.
 */

/*
INIT LOAD DATASOURCES SECTION
 */
function loadDataSources(services,ready) {
    var dataSources = {};
    var left = services.length;
    for ( var s in services ) {
        var service = services[s];

        if ( typeof service === "string" ) {
            service = {
                name: service,
                url: service
            };
        }
        dataSources[service.name] = new kendo.data.DataSource({
            type: "json",
            transport: {
                read: service.url === "string" ? service.url: service
            },
            change: function() {
                left--;
                //Should avoid this event
                if ( left == 0 ) {
                    if ( ready ) ready(dataSources);
                }
            }
        });
        dataSources[service.name].read();
    }
    return dataSources;
}


/*
 FIN LOAD DATASOURCES SECTION
 */
function dropDownEditor(value,text, url) {
    return new function(container,options) {
        $('<input data-text-field="'+text+'" data-value-field="'+value+'" data-bind="value:' + options.field + '"/>')
            .appendTo(container)
            .kendoDropDownList({
                autoBind: false,
                dataSource: {
                    type: "json",
                    transport: {
                        read: url
                    }
                }
            });
    }

}


function buildTransport(entity) {
    return {
        read:  {
            url: entity,
            type: "GET"
        },
        update: {
            url: function(user) {
                return entity+"/" + user.models[0]._id
            },
            type: "PUT"
        },
        destroy: {
            url: function(user) {
                return entity + "/" + user.models[0]._id
            },
            type: "DELETE"
        },
        create: {
            url: entity,
            type: "POST"
        },
        parameterMap: function(options, operation) {
            if (operation == "create" && options.models) {
                var model = options.models[0];
                if ( model._id == "" ) model._id = undefined;
                return model;
            }
            if ( operation == "update" && options.models) {
                return options.models[0];
            }
        }
    }
}

function getFormatDate(date,format) {
    var year = date.getYear()+1900;
    var month = date.getMonth()+1;
    var day = date.getDate();
    if ( !format || format == 'dd/MM/yyyy') {
        return day+'/'+month+'/'+year;
    } else if ( format == 'yyyy-MM-dd') {
        return year+'-'+month+'-'+day;
    }
}

function getFirstDayMonth() {
    var today = new Date();
    today.setDate(1);
    today.setHours(0);
    today.setMinutes(0);
    today.setMilliseconds(0);
    today.setSeconds(0);
    return today;
}
