/*
 * 时区设置
*/
import allTimezones from './data/timezone.js';
import {isNumber,isDate} from './untils/type.js';

export default function(datex,proto){
    let _timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let _offset = 0;

    // 时区支持
    const supportedTimezones = (typeof Intl!='undefined'&&Intl.supportedValuesOf?Intl.supportedValuesOf('timeZone'):[]);
    // 实现 PHP7.4 时区代码向 Javascript 时区代码兼容
    // 时区标准化映射: 旧标准->新标准
    const timezoneStrictMap = {
        'Africa/Asmera':'Africa/Asmara',        // 拼写标准化（2005年）
        'America/Buenos_Aires':'America/Argentina/Buenos_Aires',
        'America/Argentina/ComodRivadavia':'America/Argentina/Buenos_Aires',
        'America/Catamarca':'America/Argentina/Buenos_Aires',
        'America/Cordoba':'America/Argentina/Buenos_Aires',
        'America/Jujuy':'America/Argentina/Buenos_Aires',
        'America/Mendoza':'America/Argentina/Buenos_Aires',
        'America/Argentina/Catamarca':'America/Argentina/Buenos_Aires',
        'America/Argentina/Cordoba':'America/Argentina/Buenos_Aires',
        'America/Argentina/Jujuy':'America/Argentina/Buenos_Aires',
        'America/Argentina/Mendoza':'America/Argentina/Buenos_Aires',
        'America/Fort_Wayne':'America/Indiana/Indianapolis',    // 时区层级标准化（2006年）
        'America/Coral_Harbour':'America/Atikokan',             // 加拿大时区合并（2010年）
        'America/Godthab':'America/Nuuk',                       // 格陵兰地名更新（2018年）
        'America/Indianapolis':'America/Indiana/Indianapolis',  // 时区层级标准化（2006年）
        'America/Louisville':'America/Kentucky/Louisville',     // 时区层级标准化（2006年）
        'America/Virgin':'America/Port_of_Spain',               // 加勒比时区合并（2015年）
        'Asia/Saigon':'Asia/Ho_Chi_Minh',                       // 越南城市名更新（1975年）
        'Asia/Katmandu':'Asia/Kathmandu',                       // 尼泊尔首都拼写标准化（2005年）
        'Asia/Calcutta':'Asia/Kolkata',                         // 印度城市名标准化（2001年）
        'Asia/Rangoon':'Asia/Yangon',
        'Atlantic/Faeroe':'Atlantic/Faroe',
        'Europe/Kiev':'Europe/Kyiv',                            // 乌克兰官方拼写标准
        'Pacific/Ponape':'Pacific/Pohnpei',                     // 密克罗尼西亚拼写标准化（2005年）
        'Pacific/Enderbury':'Pacific/Kanton',                   // 基里巴斯时区更新（2017年）
    };

    const convertTimeZone = (date, timeZone) => {
        if(timezoneStrictMap[timeZone]){
            timeZone = timezoneStrictMap[timeZone];
        }
        return new Date(date.toLocaleString('en-US', { timeZone }));
    };
    const getTimezoneOffset = function(referDate,timezone){
        let match = timezone.replace(/\s/g,'').match(/(GMT|UTC)(\+|\-)?(\d{1,2})(\.|:)(\d{1,2})/);
        if(match){
            let [all,code,symbol,value,separator,subValue] = match;
            let offset = 0;
            if(separator==':'){
                offset = Number(value)*60+Number(subValue);
            }else{
                offset = Number(value+separator+subValue)*60;
            }
            if(symbol=='+'||!symbol){
                offset = -offset;
            }
            return (referDate.getTimezoneOffset()-offset)*60000;
        }else{
            let offset =  convertTimeZone(referDate,timezone).getTime() - referDate.getTime();
            offset = Math.ceil(offset/60000)*60000;
            return offset;
        }
    };

    let _referDate = new Date();

    Object.assign(datex,{
        getSupportedTimezones:function(isStrict = false,isAll = false){
            const errorTimezone = [];
            const timezones = (isAll||!supportedTimezones.length?allTimezones:supportedTimezones).filter(function(timezone){
                try{
                    new Intl.DateTimeFormat('en-US', {
                        timeZone: timezone
                    }).resolvedOptions().timeZone;
                    return true;
                }catch(e){
                    errorTimezone.push(timezone);
                    return false;
                }
            }).map(function(timezone){
                if(isStrict){
                    timezone = new Intl.DateTimeFormat('en-US', {
                        timeZone: timezone
                    }).resolvedOptions().timeZone;
                    if(timezoneStrictMap[timezone]&&!errorTimezone.includes(timezoneStrictMap[timezone])){
                        timezone = timezoneStrictMap[timezone];
                    }
                }
                return timezone;
            });
            return [...new Set(timezones)];
        },
        switchTimezone(timeZone){
            _timezone = timeZone;
            _offset = getTimezoneOffset(_referDate,_timezone);
            return this;
        },
        getTimezoneOffset(){
            return (new Date).getTimezoneOffset() - _offset/60000;
        },
        getTimezone(){
            return _timezone;
        },
    });

    Object.assign(proto,{
        _timezone:null,
        _offset:0,
        switchTimezone(timezone){
            this._timezone = timezone;
            let referDate = this._date||_referDate;
            this._offset = getTimezoneOffset(referDate,this._timezone);
            return this;
        },
        getTimezoneOffset(){
            return this._date.getTimezoneOffset() - this._offset/60000;
        },
        getTimezone(){
            return this._timezone;
        },
        isDayLightSavingTime(){
            return (
                this.getTimezoneOffset()<this.clone().set('month',1).getTimezoneOffset()||
                this.getTimezoneOffset()<this.clone().set('month',6).getTimezoneOffset()
            );
        }
    });

    proto.onInit(function(...argu){
        this._timezone = _timezone;
        this._offset = _offset;
        if(argu.length&&argu[0]){
            if(isDate(argu[0])){
            }else if(argu[0] instanceof datex){
            }else if(argu.length==1&&isNumber(argu[0])){
            }else if(_offset){
                this._date.setTime(this._date.getTime()-_offset);
            }
        }
    });

    // 重写
    let set = proto.set;
    let toObject = proto.toObject;
    Object.assign(proto,{
        // 此方法重写 toObject,toArray,set,change,get,format 等方法的时间显示
        toObject(){
            let that = this.clone();
            that._date.setTime(that._date.getTime()+that._offset);
            return toObject.bind(that)();
        },
        set(unit,value){
            // 设置指定时区为参照
            let timestamp = this._date.getTime();
            this._date.setTime(timestamp+this._offset);
            // 基于指定时区，修改参数
            let that = set.bind(this)(unit,value);
            // 恢复系统时间为参照
            let referDate = that._date||_referDate;
            that._offset = getTimezoneOffset(referDate,that._timezone);
            timestamp = that._date.getTime();
            that._date.setTime(timestamp-that._offset);
            return that;
        }
    });
};
