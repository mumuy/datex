import {periodKey,periodValue,periodTime} from './map/period';

export default function(datex,proto){

    Object.assign(proto,{
        set(unit,value){
            let _ = this._date;
            let $ = this.toObject();
            switch (unit) {
                case 'year':
                    _.setFullYear(value);
                    break;
                case 'month':
                    _.setMonth(value-1);
                    break;
                case 'day':
                    _.setDate(value);
                    break;
                case 'hour':
                    _.setHours(value);
                    break;
                case 'minute':
                    _.setMinutes(value);
                    break;
                case 'second':
                    _.setSeconds(value);
                    break;
                case 'millsecond':
                    _.setMilliseconds(value);
                    break;
                case 'timestamp':
                    _.setTime(value);
                    break;
                case 'week':
                    _.setDate($.day-$.week+value);
                    break;
            }
            return this;
        },
        change(unit,value){
            let $ = this.toObject();
            if(typeof periodTime[unit]!='undefined'){
                return this.set('timestamp',$['timestamp']+value*periodTime[unit]);
            }else{
                return this.set(unit,$[unit]+value);
            }
        },
        get(unit){
            let $ = this.toObject();
            return $[unit];
        },
        endOf(unit){
            return this.startOf(unit).change(unit,unit=='week'?7:1).change('millsecond',-1);
        },
        startOf(unit){
            let $ = this.toObject();
            let that = null;
            let index = periodKey.indexOf(unit)+1;
            let dateSet = this.toArray();
            let initSet = periodValue.slice(index);
            dateSet.splice(index,initSet.length,...initSet);
            if(unit=='timestamp'){
                that = this.clone();
            }else if(unit=='week'){
                that = datex($.year,$.month,$.day-$.week,0,0,0,0);
            }else{
                that = datex(...dateSet);
            }
            return that;
        }
    });
};
