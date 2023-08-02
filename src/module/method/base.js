import {periodKey} from './map/period';

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
            return datex(this.getTime());
        },
        isValid(){
            return !isNaN(this.getTime());
        },
        format(pattern = 'YYYY-MM-DD HH:mm:ss'){
            let that = this.clone();
            let offset = (this._offset||0);
            that._date.setTime(this._date.getTime()+offset);
            let _ = that._date;
            let $ = that.toObject();
            let match = _.toTimeString().match(/GMT([\+\-])(\d{2})(\d{2})/);
            let map = {
                'YYYY':''+$.year,
                'YY':(''+$.year).padStart(2,'0'),
                'MM':(''+$.month).padStart(2,'0'),
                'M':''+$.month,
                'DD':(''+$.day).padStart(2,'0'),
                'D':''+$.day,
                'HH':(''+$.hour).padStart(2,'0'),
                'H':''+$.hour,
                'hh':(''+($.hour%12)).padStart(2,'0'),
                'h':''+($.hour%12),
                'mm':(''+$.minute).padStart(2,'0'),
                'm':''+$.minute,
                'ss':(''+$.second).padStart(2,'0'),
                's':''+$.second,
                'S':''+(~~(($.millsecond%1000)/100)),
                'SS':''+(~~(($.millsecond%1000)/10)),
                'SSS':''+($.millsecond%1000),
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
                return map[key]||'';
            });
        }
    });
};
