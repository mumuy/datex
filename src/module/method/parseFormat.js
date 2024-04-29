/*
 * 自定义初始化格式字符串
*/
import {periodKey,sign2key} from './config/period.js';
import {isString} from './untils/type.js';

export default function(datex,proto){

    let languageMap= datex.getLanguage();

    let customParseFormat = function(formatStr,pattern){
        let keyList = [];
        let patternStr = pattern.replace(/Y+|M+|Do|D+|H+|h+|m+|s+|S+|Z+|A|a|X|x|Q|W+/g,function(sign,index){
            if(languageMap['format'][sign]){
                if(['MMM','MMMM'].includes(sign)){
                    keyList.push('month');
                    return '('+languageMap['format'][sign].join('|')+')';
                }else if(['Do'].includes(sign)){
                    keyList.push('day');
                    return '('+languageMap['format'][sign].join('|')+')';
                }else if(['WW','WWW'].includes(sign)){
                    keyList.push('week');
                    return '('+languageMap['format'][sign].join('|')+')';
                }
            }else if(sign2key[sign[0]]){
                keyList.push(sign2key[sign[0]]);
                return '(\\d{1,'+sign.length+'})';
            }else if(['h','hh'].includes(sign)){
                keyList.push('hour_12');
                return '(\\d{1,2})';
            }else if(sign=='ZZ'){
                keyList.push('timezone');
                return '(\-?\\d{2}\\d{2})';
            }else if(sign=='Z'){
                keyList.push('timezone');
                return '(\-?\\d{2}:\\d{2})';
            }else if(sign=='A'){
                keyList.push('am_pm');
                return '(AM|PM)';
            }else if(sign=='a'){
                keyList.push('am_pm');
                return '(am|pm)';
            }else if(sign=='X'){
                keyList.push('timestamp');
                return '(\d+)';
            }else if(sign=='x'){
                keyList.push('unix');
                return '(\d+)';
            }
            return sign;
        });
        let keyMap = {};
        let matchs = formatStr.match(new RegExp(patternStr));
        if(matchs){
            matchs.slice(1).forEach(function(value,index){
                let unit = keyList[index];
                keyMap[unit] = value;
            });
        }
        let $ = {};
        periodKey.forEach(function(unit){
            if(+keyMap[unit]){
                $[unit] = +keyMap[unit];
            }
        });
        if(keyMap['hour_12']){
            $['hour'] = +keyMap['hour_12'];
            if(keyMap['am_pm']&&['PM','pm'].includes(keyMap['am_pm'])){
                $['hour'] += 12;
            }
        }else if(keyMap['timestamp']){
            $ = datex(keyMap['timestamp']).toObject();
        }else if(keyMap['unix']){
            $ = datex(keyMap['unix']*1000).toObject();
        }
        return $;
    };

    // 重写
    proto.onInit(function(...argu){
        let param = argu.slice(0);
        if(param.length&&param[0]){
            if(param.length==2&&isString(param[0])&&isString(param[1])){
                let map = customParseFormat(param[0],param[1]);
                if(Object.keys(map).length){
                    this._date = datex(map).toDate();
                }else{
                    this._date = new Date(''); // 设置为 Invalid Date
                }
            }
        }
    });
}
