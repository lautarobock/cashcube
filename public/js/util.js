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

    /**
     * Creates a WeekHelper for the month (0..11). and Year (YYYY).
     * @param startDow day of start to count weeks
     */
    exports.WeekHelper = function(year, month, startDow) {
        var start = new Date(year,month,1);
        var end = new Date(year,month+1,0);
        
        var actualWeek = 1;
        var weeks = [0,actualWeek]; //first day is allways first week
        for ( var i=2; i<=end.getDate(); i++ ) {
            var actualDate = new Date(year,month,i);
            var dow = actualDate.getDay();
            if (dow === startDow) actualWeek++;
            weeks[i] = actualWeek;
        }
        this.getWeek = function(day) {
            return weeks[day];
        };
    };
    /**
     * TODO
     * Este hace el calculo directamente.
     * Creo que teniendo el largo de la primera partial-week
     * ya puedo hacer el calculo directamente.
     */
    exports.getWeekFrom = function(date,fromDOW) {
        return exports.getWeek(date.getDate());
    };

})(typeof exports === 'undefined'? this['util'] = {} : exports );
