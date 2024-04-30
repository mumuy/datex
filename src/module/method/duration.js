/*
 * 时长间隔相关方法
*/ 
import {periodKey,periodMap,sign2key} from './config/period.js';
import {isObject,isNumber,isString,isFunction} from './untils/type.js';

class duration{
    #source = null;
    #target = null;
    #timeValue = 0;
    constructor(...param){
        let _ = this;
        if(param.length==2){
            if(isObject(param[0])&&isObject(param[1])){
                _.#source = param[0];
                _.#target = param[1];
                _.#timeValue = _.#source.getTime() - _.#target.getTime();
            }else if(isNumber(param[0])&&isString(param[1])){
                _.change(param[1],param[0]);
            }
        }else if(param.length==1){
            if(isObject(param[0])){
                for(let unit in param[0]){
                    _.change(unit,param[0][unit]);
                }
            }else if(isNumber(param[0])){
                _.#timeValue += param[0];
            }
        }
    }
    #getResultByKeys(keys){
        let _ = this;
        let $ = {};
        if(_.#source&&_.#target){
            let timevalue = _.#timeValue;
            let source = _.#source.clone();
            let target = _.#target.clone();
            keys.forEach(function(unit){
                $[unit] = _.get(unit);
                _.change(unit,-$[unit]);
            });
            _.#timeValue = timevalue;
            _.#source = source;
            _.#target = target;
        }else{
            let timevalue = _.#timeValue;
            keys.forEach(function(unit){
                if(periodMap[unit]){
                    $[unit] = Math.floor(timevalue/periodMap[unit])||0;
                    timevalue = timevalue%periodMap[unit];
                }
            });
        }
        return $;
    }
    change(unit,value){
        let _ = this;
        if(_.#source&&_.#target){
            _.#source.change(unit,value);
            _.#timeValue = _.#source.getTime() - _.#target.getTime();
        }else if(periodMap[unit]){
            _.#timeValue += periodMap[unit]*value;
        }
        return _;
    }
    get(unit){
        let _ = this;
        if(unit){
            if(_.#source&&_.#target){
                let source = _.#source;
                let target = _.#target;
                let timeValue = _.#timeValue;
                let value = 0;
                if(unit=='month'){
                    let source_month = 12*(source.get('year')-1)+source.get('month');
                    let target_month = 12*(target.get('year')-1)+target.get('month');
                    value = source_month - target_month;
                    if(value<0&&source.get('day')>target.get('day')){
                        value+=1;
                    }else if(value>0&&source.get('day')<target.get('day')){
                        value-=1;
                    }
                }else if(unit=='year'){
                    value = source.get('year') - target.get('year');
                    if(value<0&&(source.get('month')>target.get('month')||source.get('month')==target.get('month')&&source.get('day')>target.get('day'))){
                        value+=1;
                    }else if(value>0&&(source.get('month')<target.get('month')||source.get('month')==target.get('month')&&source.get('day')<target.get('day'))){
                        value-=1;
                    }
                }else if(periodMap[unit]){
                    value = ~~(timeValue/periodMap[unit]);
                }
                return value;
            }else if(periodMap[unit]){
                return Math.floor(_.#timeValue/periodMap[unit])||0;
            }else {
                return 0;
            }
        }else{
            return _.#timeValue;
        }
    }
    toObject(){
        let _ = this;
        return Object.assign({
            value:_.#timeValue
        },_.#getResultByKeys(periodKey));
    }
    format(pattern = 'YYYY-MM-DD HH:mm:ss'){
        let _ = this
        if(isString(pattern)){
            let keys = [];
            pattern.match(/Y+|M+|D+|H+|m+|s+|S+/g).forEach(function(sign){
                let key = sign2key[sign[0]];
                if(!keys.includes(key)){
                    keys.push(key);
                }
            });
            let $ = _.#getResultByKeys(keys);
            let map = {
                'Y':''+$.year,
                'M':''+$.month,
                'D':''+$.day,
                'H':''+$.hour,
                'm':''+$.minute,
                's':''+$.second,
                'S':''+$.millsecond,
            };
            return pattern.replace(/Y+|M+|D+|H+|m+|s+|S+/g,function(key){
                if(map[key]){
                    return map[key];
                }else if(map[key[0]]){
                    let isNegative = map[key[0]]<0;
                    let str = Math.abs(map[key[0]]).toString().padStart(key.length,'0');
                    return isNegative?'-'+str:str;
                }
                return '';
            });
        }else if(isFunction(pattern)){
            return pattern(this.toObject()).toString()||'';
        }
    }
}

export default function(datex,proto){
    Object.assign(datex,{
        duration(...param){
            return new duration(...param);
        }
    });

    Object.assign(proto,{
        diffWith(that,unit){
            that = datex(that);
            if(!that.isValid()){
                return 0;
            }
            let duration = datex.duration(this,that);
            if(unit){
                return duration.get(unit);
            }else{
                return duration;
            }
        },
        fromNow(){
            let now = datex();
            let duration = datex.duration(this,now);
            let $ = duration.toObject();
            let isPast = $.value<0;
            let result = '';
            let languageMap= datex.getLanguage();
            const lang = this.getLanguageCode();
            const rtf = new Intl.RelativeTimeFormat(lang);
            ['year','month','day','hour','minute','second'].forEach(function(unit){
                let value = $[unit];
                if(!result&&value){
                    result = rtf.format(value, unit);
                }
            });
            if(!result){
                if($.value){
                    result = (isPast?languageMap['duration']['past moments']:languageMap['duration']['future moments']);
                }else{
                    result = languageMap['duration']['now'];
                } 
            }
            return result;
        }
    });
};
