/**
 * Created with JetBrains WebStorm.
 * User: lautaro
 * Date: 18/07/13
 * Time: 19:17
 * To change this template use File | Settings | File Templates.
 */

(function(exports) {

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
        var weeksByDay = [0,actualWeek]; //first day is allways first week
        
        var actualFrom = 1;
        var weeks = [];
        
        for ( var i=2; i<=end.getDate(); i++ ) {
            var actualDate = new Date(year,month,i);
            var dow = actualDate.getDay();
            if (dow === startDow) {
                weeks.push({
                    from: actualFrom,
                    to: i-1,
                    week: actualWeek
                });
                actualWeek++;
                actualFrom = i;
            }
            weeksByDay[i] = actualWeek;
        }
        weeks.push({
            from: actualFrom,
            to: end.getDate(),
            week: actualWeek
        });

    
        this.getWeek = function(day) {
            return weeksByDay[day];
        };
        
        this.getAllWeeks = function() {
            return weeks;
        };
    };
    

})(typeof exports === 'undefined'? this['util'] = {} : exports );
