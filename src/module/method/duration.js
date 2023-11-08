import {periodMap,sign2key} from './config/period';

class duration{
    _timevalue = 0;
    constructor(value,unit){
        if(typeof unit=='string'){
            this.change(unit,value);
        }else if(typeof value=='object'){
            for(let unit in value){
                this.change(unit,value[unit]);
            }
        }else if(typeof value=='number'){
            this._timevalue += value;
        }
    }
    change(unit,value){
        if(periodMap[unit]){
            this._timevalue += periodMap[unit]*value;
        }
        return this;
    }
    get(unit){
        if(unit){
            if(periodMap[unit]){
                return Math.floor(this._timevalue/periodMap[unit])||0;
            }else {
                return 0;
            }
        }else{
            return this._timevalue;
        }
    }
    format(pattern = 'YYYY-MM-DD HH:mm:ss'){
        let _ = this
        let periodKey = [];
        pattern.match(/Y+|M+|D+|H+|h+|m+|s+|S+/g).forEach(function(sign){
            let key = sign2key[sign[0]];
            if(!periodKey.includes(key)){
                periodKey.push(key);
            }
        });
        let $ = {};
        let timevalue = _._timevalue;
        periodKey.forEach(function(unit){
            if(periodMap[unit]){
                $[unit] = Math.floor(timevalue/periodMap[unit])||0;
                timevalue = timevalue%periodMap[unit];
            }
        });
        let map = {
            'Y':''+$.year,
            'M':''+$.month,
            'D':''+$.day,
            'H':''+$.hour,
            'm':''+$.minute,
            's':''+$.second,
            'S':''+$.millsecond,
        };
        return pattern.replace(/Y+|M+|D+|H+|h+|m+|s+|S+/g,function(key){
            return map[key]||map[key[0]].padStart(key.length,'0')||'';
        });
    }
}

export default function(datex,proto){
    Object.assign(datex,{
        duration(...param){
            return new duration(...param);
        }
    });
};
