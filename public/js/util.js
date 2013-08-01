/**
 * Created with JetBrains WebStorm.
 * User: lautaro
 * Date: 18/07/13
 * Time: 19:17
 * To change this template use File | Settings | File Templates.
 */

(function(exporte) {

    exports.createFirstDay = function(year,month) {
        return new Date(year,month-1,1);
    };

    exports.createLastDay = function(year,month) {
        return new Date(year,month,1);
    };

    exports.getWeek = function(day) {
        return Math.floor((day-1) / 7) + 1;
    };

    exports.getWeekFrom = function(date,fromDOW) {
        return exports.getWeek(date.getDate());
    };

})(typeof exports === 'undefined'? this['util'] = {} : exports );
