/*
 * 判定状态方法
*/

export default function(datex,proto){

    Object.assign(proto,{
        isLeapYear(){
            return datex(this.get('year'),2,29).isValid();
        },
        isToday(){
            return this.format('YYYY-MM-DD') === datex().format('YYYY-MM-DD');
        },
        isWeekend(){
            const week = this.get('week');
            return week === 0 || week === 6;
        },
        daysInMonth(){
            return this.endOf('month').get('day');
        },
        daysInYear(){
            return this.isLeapYear() ? 366 : 365;
        }
    });
};