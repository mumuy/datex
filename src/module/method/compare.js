/*
 * 对比方法
*/
import { isArray} from './utils/type.js';

export default function(datex,proto){
    Object.assign(datex,{
        min: function(...params){
            if(params.length === 1&& isArray(params[0])){
                params = params[0];
            }
            params = params.map(time=>datex(time));
            return params.reduce((a,b)=>a.isBefore(b)?a:b);
        },
        max: function(...params){
            if(params.length === 1&& isArray(params[0])){
                params = params[0];
            }
            params = params.map(time=>datex(time));
            return params.reduce((a,b)=>a.isAfter(b)?a:b);
        }
    });

    Object.assign(proto,{
        isAfter(that,unit = 'timestamp'){
            that = datex(that);
            return this.get(unit)>that.get(unit);
        },
        isBefore(that,unit = 'timestamp'){
            that = datex(that);
            return this.get(unit)<that.get(unit);
        },
        isBetween(startDate,endDate,unit = 'timestamp'){
            startDate = datex(startDate);
            endDate = datex(endDate);
            return this.get(unit)>startDate.get(unit)&&this.get(unit)<endDate.get(unit);
        },
        isSame(that,unit = 'timestamp'){
            that = datex(that);
            return this.get(unit)==that.get(unit);
        }
    });
};