import {periodKey,periodValue,periodTime} from './map/period';

export default function(datex,proto){

    Object.assign(proto,{
        diffWith(that,unit){
            that = datex(that);
            if(!that.isValid()){
                return false;
            }
            let timestamp = this.getTime()-that.getTime();
            let value = 0;
            if(unit){
                if(periodTime[unit]){
                    value = ~~(timestamp/periodTime[unit]);
                }else if(unit=='month'){
                    let this_month = 12*(this.get('year')-1)+this.get('month');
                    let that_month = 12*(that.get('year')-1)+that.get('month');
                    value = this_month -that_month;
                    if(value<0&&this.get('day')>that.get('day')){
                        value+=1;
                    }else if(value>0&&this.get('day')<that.get('day')){
                        value-=1;
                    }
                }else if(unit=='year'){
                    value = this.get('year') - that.get('year');
                    if(value<0&&(this.get('month')>that.get('month')||this.get('month')==that.get('month')&&this.get('day')>that.get('day'))){
                        value+=1;
                    }else if(value>0&&(this.get('month')<that.get('month')||this.get('month')==that.get('month')&&this.get('day')<that.get('day'))){
                        value-=1;
                    }
                }
                return value;
            }else{
                let clone = this.clone();
                let hash = {};
                periodKey.forEach(function(unit){
                    hash[unit] = clone.diffWith(that,unit);
                    clone.set(unit,that.get(unit));
                });
                return hash;
            }
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
