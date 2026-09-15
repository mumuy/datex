/*
 * 计算推断方法
*/
import {periodKey,periodValue} from './config/period.js';

export default function(datex,proto){

    Object.assign(proto,{
        endOf(unit){
            return this.startOf(unit).change(unit,unit=='week'?7:1).change('millsecond',-1);
        },
        startOf(unit){
            let that = this.clone();
            if(unit=='timestamp'){
                return that;
            }else if(unit=='week'){
                let $ = that.toObject();
                return datex($.year,$.month,$.day-$.week,0,0,0,0);
            }else{
                let index = periodKey.indexOf(unit)+1;
                let initSet = periodValue.slice(index);
                let dateSet = that.toArray();
                dateSet.splice(index,initSet.length,...initSet);
                return datex(...dateSet);
            }
        }
    });
};