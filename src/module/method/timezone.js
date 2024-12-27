/*
 * 时区设置
*/
import {isNumber,isDate} from './untils/type.js';

export default function(datex,proto){
    let _timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let _offset = 0;

    const convertTimeZone = (date, timeZone) => {return new Date(date.toLocaleString('en-US', { timeZone }));};
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
        supportedTimezones:(typeof Intl!='undefined'&&Intl.supportedValuesOf?Intl.supportedValuesOf('timeZone'):[]),
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
