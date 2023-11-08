import {periodKey,periodMap} from './config/period';

export default function(datex,proto){

    Object.assign(proto,{
        toDate(){
            return this._date;
        },
        toObject(){
            let _ = this._date;
            return {
                'year':_.getFullYear(),
                'month':_.getMonth()+1,
                'day':_.getDate(),
                'hour':_.getHours(),
                'minute':_.getMinutes(),
                'second':_.getSeconds(),
                'millsecond':_.getMilliseconds(),
                'timestamp':_.getTime(),
                'week':_.getDay()
            };
        },
        toArray(){
            let $ = this.toObject();
            return periodKey.map(name=>$[name]);
        },
        toString(){
            return this._date.toString();
        },
        toISOString(){
            return this._date.toISOString();
        },
        getTime(){
            return this._date.getTime();
        },
        getUnix(){
            return ~~(this._date.getTime()/1000);
        },
        clone(){
            let that = this;
            let clone =  datex(this.getTime());
            Object.getOwnPropertyNames(that).forEach(function(name){
                if(name!='_date'){
                    clone[name] = that[name];
                }
            });
            return clone;
        },
        isValid(){
            return !isNaN(this.getTime());
        },
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
            if(['day','hour','minute','second','millsecond'].includes(unit)){
                return this.set('timestamp',$['timestamp']+value*periodMap[unit]);
            }else{
                return this.set(unit,$[unit]+value);
            }
        },
        get(unit){
            let $ = this.toObject();
            return $[unit];
        },
        format(pattern = 'YYYY-MM-DD HH:mm:ss'){
            let that = this.clone();
            let _ = that._date;
            let $ = that.toObject();
            let match = _.toTimeString().match(/GMT([\+\-])(\d{2})(\d{2})/);
            let map = {
                'YYYY':(''+$.year).padStart(4,'0'),
                'YY':(''+($.year%100)).padStart(2,'0'),
                'M':''+$.month,
                'D':''+$.day,
                'H':''+$.hour,
                'h':''+($.hour%12),
                'm':''+$.minute,
                's':''+$.second,
                'S':''+(~~($.millsecond/100)),
                'SS':''+(~~($.millsecond/10)),
                'SSS':''+$.millsecond,
                'Z':match[1]+match[2]+':'+match[3],
                'ZZ':match[1]+match[2]+match[3],
                'A':['AM','PM'][~~($.hour/12)],
                'a':['am','pm'][~~($.hour/12)],
                'X':$.timestamp,
                'x':~~($.timestamp/1000),
                'Q':''+(~~($.month/3)),
                'W':$.week
            };
            return pattern.replace(/Y+|M+|D+|H+|h+|m+|s+|S+|Z+|A|a|X|x|Q|W+/g,function(key){
                return map[key]||map[key[0]].padStart(key.length,'0')||'';
            });
        }
    });
};
