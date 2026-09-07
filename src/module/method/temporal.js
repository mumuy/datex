/*
 * Temporal解析支持
*/
import {isString} from './utils/type.js';

const isSupportTemporal = typeof Temporal !== 'undefined';


function isInstant(value){
    return typeof Temporal !== 'undefined' && value instanceof Temporal.Instant;
}

function isZonedDateTime(value){
    return typeof Temporal !== 'undefined' && value instanceof Temporal.ZonedDateTime;
}

function isPlainDateTime(value){
    return typeof Temporal !== 'undefined' && value instanceof Temporal.PlainDateTime;
}

function isPlainDate(value){
    return typeof Temporal !== 'undefined' && value instanceof Temporal.PlainDate;
}

function isPlainTime(value){
    return typeof Temporal !== 'undefined' && value instanceof Temporal.PlainTime;
}

function isPlainYearMonth(value){
    return typeof Temporal !== 'undefined' && value instanceof Temporal.PlainYearMonth;
}

function isPlainMonthDay(value){
    return typeof Temporal !== 'undefined' && value instanceof Temporal.PlainMonthDay;
}


export default function(datex,proto){

    Object.assign(proto,{
        toInstant(){
            return isSupportTemporal?Temporal.Instant.fromEpochMilliseconds(this.getTime()):null;
        },
        toZonedDateTime(){
            return isSupportTemporal?Temporal.Instant.fromEpochMilliseconds(this.getTime()).toZonedDateTimeISO(this._timezone):null;
        },
        toPlainDateTime(){
            return isSupportTemporal?this.toZonedDateTime().toPlainDateTime():null;
        },
        toPlainDate(){
            return isSupportTemporal?this.toZonedDateTime().toPlainDate():null;
        },
        toPlainYearMonth(){
            return isSupportTemporal?this.toPlainDate().toPlainYearMonth():null;
        },
        toPlainMonthDay(){
            return isSupportTemporal?this.toPlainDate().toPlainMonthDay():null;
        },
        toPlainTime(){
            return isSupportTemporal?this.toZonedDateTime().toPlainTime():null;
        }
    });

    proto.onInit(function(...argu){
        let params = argu.slice(0);
        let hasMatch = false;

        const timezone = proto.getTimezone();
  
        if(params.length&&params[0]){
            if(params.length==1){
                let param = params[0];
                if(isSupportTemporal){
                    if(isString(param)){
                        let matchs = param.match(/(\d{1,4})[\-\/](\d{1,2})[\-\/](\d{1,2})([\sT](\d{1,2})?:(\d{1,2})?(:(\d{1,2}))?(\.(\d{1,9}))?)?([+-]\d{2}:\d{2})\[[a-zA-Z\-\/_]+\]/);
                        if(matchs&&Temporal?.ZonedDateTime){
                            const zonedDateTime = Temporal.ZonedDateTime.from(param);
                            this._date = new Date(zonedDateTime.epochMilliseconds);
                            this._timezone = zonedDateTime.timeZoneId;
                            this._offset = (zonedDateTime.offsetNanoseconds - zonedDateTime.withTimeZone(timezone).offsetNanoseconds)/1000000;
                            hasMatch = true;
                        }
                    }else if(isInstant(param)){
                        const instant = param;
                        this._date = new Date(instant.epochMilliseconds);
                        hasMatch = true;
                    }else{
                        let zonedDateTime = null;
                        if(isPlainYearMonth(param)){
                            const PlainYearMonth = param;
                            const Day = 1;
                            param = PlainYearMonth.toPlainDate({day:Day});
                        }else if(isPlainMonthDay(param)){
                            const Year = 1970;
                            const PlainMonthDay = param;
                            param = PlainMonthDay.toPlainDate({year:Year});
                        }
                        if(isPlainDateTime(param)){
                            const plainDateTime = param;
                            zonedDateTime = plainDateTime.toZonedDateTime(this.getTimezone());
                        }else if(isPlainDate(param)){
                            const plainDate = param;
                            const plainTime = Temporal.PlainTime.from('00:00:00');
                            zonedDateTime = plainDate.toPlainDateTime(plainTime).toZonedDateTime(this.getTimezone());
                        }else if(isPlainTime(param)){
                            const plainDate = Temporal.Now.plainDateISO();
                            const plainTime = param;
                            zonedDateTime = plainDate.toPlainDateTime(plainTime).toZonedDateTime(this.getTimezone());
                        }
                        if(isZonedDateTime(param)){
                            const zonedDateTime = param;
                            this._date = new Date(zonedDateTime.epochMilliseconds);
                            this._timezone = zonedDateTime.timeZoneId;
                            this._offset = (zonedDateTime.offsetNanoseconds - zonedDateTime.withTimeZone(timezone).offsetNanoseconds)/1000000;
                            hasMatch = true;
                        }
                    }
                }
            }
        }
        if(hasMatch){
            if(this._offset){
                this._date.setTime(this._date.getTime()-this._offset);
            }
        }
    });
}