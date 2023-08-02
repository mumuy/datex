import {periodKey,periodTime} from './map/period';

export default function(datex,proto){

    function getInstance(that){
        return that instanceof datex?that:datex(that);
    }

    Object.assign(proto,{
        diffWith(that,unit){
            that = getInstance(that);
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
        isAfter(that,unit = 'timestamp'){
            that = getInstance(that);
            return this.get(unit)>that.get(unit);
        },
        isBefore(that,unit = 'timestamp'){
            that = getInstance(that);
            return this.get(unit)<that.get(unit);
        },
        isBetween(startDate,endDate,unit = 'timestamp'){
            startDate = getInstance(startDate);
            endDate = getInstance(endDate);
            return this.get(unit)>startDate.get(unit)&&this.get(unit)<endDate.get(unit);
        },
        isSame(that,unit = 'timestamp'){
            that = getInstance(that);
            return this.get(unit)==that.get(unit);
        }
    });
};
