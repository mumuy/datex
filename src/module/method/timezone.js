/*
 * 时区设置
*/
import allTimezones from './data/timezone.js';
import {isObject,isString,isZonedDateTime} from './utils/type.js';

export default function(datex,proto){
    const _local_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let _timezone = _local_timezone;
    let _offset = 0;
    let _referDate = new Date();
    const isSupportTemporal = typeof Temporal !== 'undefined';

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
        'America/Argentina/Rosario':'America/Argentina/Buenos_Aires',
        'America/Creston':'America/Dawson_Creek',
        'America/Lower_Princes':'America/St_Thomas',
        'America/Fort_Wayne':'America/Indiana/Indianapolis',    // 时区层级标准化（2006年）
        'America/Coral_Harbour':'America/Panama',               // 加拿大时区合并（2010年）
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
        'Pacific/Truk':'Pacific/Chuuk',
        'Pacific/Easter':'America/Rapa_Nui',                    // 复活节岛代码调整（2018年）
        'Pacific/Ponape':'Pacific/Pohnpei',                     // 密克罗尼西亚拼写标准化（2005年）
        'Pacific/Kosrae':'Pacific/Pohnpei',
        'Pacific/Enderbury':'Pacific/Kanton',                   // 基里巴斯时区更新（2017年）
    };
    // 新标准 -> 旧标准
    const timezoneOldMap = {
        'America/Coyhaique':'America/Santiago',                 // 地理标识拆分（2025年）
        'Arctic/Longyearbyen':'Europe/Oslo',                    // 独立标识北极（2024年）
        'Asia/Pontianak':'Asia/Jakarta',                        // 原共享时区，因地理行政需求独立标识（2023年）
        'Africa/Juba':'Africa/Khartoum',                        // 南苏丹独立（2022年）
        'America/St_Barthelemy':'America/Puerto_Rico',          // 独立标识加勒比小众地区（2021年）
        'Europe/Kaliningrad':'Europe/Moscow',                   // 加里宁格勒时区规则调整（2020年）
        'Asia/Yangon':'Asia/Rangoon',                           // 恢复独立条目（曾合并至Asia/Rangoon）（2019年）
        'America/Marigot':'America/Guadeloupe',                 // 独立标识（2018年）
        'Asia/Qostana':'Asia/Novosibirsk',                      // 适配哈萨克斯坦时区调整（UTC+5 无夏令时）(2017年)
        'Africa/El_Aaiun':'Africa/Casablanca',                  // 独立标识（2016年）
        'America/Rankin_Inlet':'America/Winnipeg',              // 拆分，适配加拿大北部时区微调（2015年）
    };
    Object.entries(timezoneStrictMap).forEach(function([oldKey,newKey]){
        timezoneOldMap[newKey] = oldKey;
    });

    // 获取时区时间差
    const getTimezoneOffset = function(referDate,timezone){
        // 时区名称映射
        if(!isSupportedTimezone(timezone)){
            if(timezoneOldMap[timezone]){
                timezone = timezoneOldMap[timezone];
            }
        }
        // 兼容 UTC+8:00 时区表示
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
        }else if(isSupportTemporal&&Temporal?.ZonedDateTime){       // Temportal 时区切换
            const zonedDateTime = Temporal.ZonedDateTime.from(referDate.toISOString()+`[${_local_timezone}]`);
            return (zonedDateTime.withTimeZone(timezone).offsetNanoseconds - zonedDateTime.offsetNanoseconds)/1000000;
        }else{                                                      // toLocaleString 时区切换
            const targetDate = new Date(referDate.toLocaleString('en-US', { timeZone:timezone }));
            let offset =  targetDate.getTime() - referDate.getTime();
            offset = Math.ceil(offset/60000)*60000;
            return offset;
        }
    };
    // 获取最新支持的时区
    const getStrictTimezone = function(timezone){
        try{
            timezone = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone
            }).resolvedOptions().timeZone;
        }catch(e){
        }
        if(timezoneStrictMap[timezone]){
            timezone = timezoneStrictMap[timezone];
        }
        return timezone;
    };
    // 检测时区是否被环境支持
    const isSupportedTimezone = function(timezone){
        try{
            new Intl.DateTimeFormat('en-US', {
                timeZone: timezone
            });
            return true;
        }catch(e){
            return false;
        }
    };

    Object.assign(datex,{
        isSupportedTimezone:function(timezone){
            let isSupported = isSupportedTimezone(timezone);
            if(!isSupported){
                return timezoneOldMap[timezone]?true:false;
            }
            return isSupported;
        },
        getSupportedTimezones:function(isStrict = false,isAll = false){
            const timezones = (isAll||!supportedTimezones.length?allTimezones:supportedTimezones).map(function(timezone){
                return isStrict?getStrictTimezone(timezone):timezone;
            });
            return [...new Set(timezones)];
        },
        switchTimezone(timeZone){
            _timezone = timeZone;
            _offset = getTimezoneOffset(_referDate,_timezone);
            return this;
        },
        utc(...param){
            return datex().switchTimezone('UTC').parse(...param);
        },
        local(){
            return this.switchTimezone(_local_timezone);
        },
        getTimezoneOffset(){
            return (new Date).getTimezoneOffset() - _offset/60000;
        },
        getTimezone(){
            return _timezone;
        }
    });

    Object.assign(proto,{
        _timezone:null,
        _offset:0,
        switchTimezone(timezone){
            this._timezone = timezone;
            // 恢复系统时间为参照
            let referDate = this._date||_referDate;
            this._offset = getTimezoneOffset(referDate,this._timezone);
            return this;
        },
        utc(...param){
            return datex().switchTimezone('UTC').parse(...param);
        },
        local(){
            return this.switchTimezone(_local_timezone);
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
        },
        toZonedDateTime(){
            return isSupportTemporal?new Temporal.ZonedDateTime(BigInt(this.getTime()*1000000), this._timezone):null;
        }
    });

    proto.onInit(function(...argu){
        this._timezone = _timezone;
        this._offset = _offset;
        let params = argu.slice(0);
        if(params.length&&params[0]){
            if(params.length==1){
                if(isSupportTemporal){
                    if(isString(params[0])){
                        let matchs = params[0].match(/(\d{1,4})[\-\/](\d{1,2})[\-\/](\d{1,2})([\sT](\d{1,2})?:(\d{1,2})?(:(\d{1,2}))?(\.(\d{1,9}))?)?([+-]\d{2}:\d{2})\[[a-zA-Z\-\/_]+\]/);
                        if(matchs&&Temporal?.ZonedDateTime){
                            const zonedDateTime = Temporal.ZonedDateTime.from(params[0]);
                            this._date = new Date(zonedDateTime.epochMilliseconds);
                            this._timezone = zonedDateTime.timeZoneId;
                            this._offset = (zonedDateTime.offsetNanoseconds - zonedDateTime.withTimeZone(_local_timezone).offsetNanoseconds)/1000000;
                            return this;
                        }
                    }else if(isZonedDateTime(params[0])){
                        const zonedDateTime = params[0];
                        this._date = new Date(zonedDateTime.epochMilliseconds);
                        this._timezone = zonedDateTime.timeZoneId;
                        this._offset = (zonedDateTime.offsetNanoseconds - zonedDateTime.withTimeZone(_local_timezone).offsetNanoseconds)/1000000;
                        return this;
                    }
                }
                if(isObject(params[0])){
                    if(params[0].timezone){
                        this._timezone = params[0].timezone;
                        this._offset = getTimezoneOffset(_referDate,this._timezone);
                    }
                }
            }
        }
        if(this.isValid()){
            if(this._offset){
                this._date.setTime(this._date.getTime()-this._offset);
            }
        }
    });

    // 重写
    let set = proto.set;
    let toObject = proto.toObject;
    Object.assign(proto,{
        // 此方法重写 toObject,toArray,set,change,get,format 等方法的时间显示
        toObject(){
            const timestamp = this.getTime();
            let that = this.clone();
            that._date.setTime(timestamp+that._offset);
            const temp = toObject.bind(that)();
            temp['timezone'] = this._timezone;
            temp['timestamp'] = timestamp;
            return temp;
        },
        set(unit,value){
            const timestamp = this.getTime();
            let that = this.clone();
            if(unit!='timestamp'){   // 只计算设过程中的差异量
                const that_timestamp = timestamp+this._offset;
                that._date.setTime(that_timestamp);
                that = set.bind(that)(unit,value);
                const duration = that.getTime() - that_timestamp;
                that._date.setTime(timestamp + duration);
            }else{
                that = set.bind(that)(unit,value);
            }
            that._offset = getTimezoneOffset(that._date,that._timezone);
            return that;
        }
    });
};
