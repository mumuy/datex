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
