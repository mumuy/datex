/*
 * 时区设置
*/
import {isNumber,isDate} from './untils/type.js';

export default function(datex,proto){
    let _timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let _offset = 0;

    const convertTimeZone = (date, timeZone) => {return new Date(date.toLocaleString('en-US', { timeZone }))};

    let _referDate = new Date();

    Object.assign(datex,{
        supportedTimezones:(typeof Intl!='undefined'&&Intl.supportedValuesOf?Intl.supportedValuesOf('timeZone'):[]),
        switchTimezone(timeZone){
            _timezone = timeZone;
            let offset =  convertTimeZone(_referDate,_timezone).getTime() - _referDate.getTime();
            _offset = Math.ceil(offset/60000)*60000;
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
            let offset =  convertTimeZone(referDate,this._timezone).getTime() - referDate.getTime();
            this._offset =  Math.ceil(offset/60000)*60000;
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
    let format = proto.format;
    Object.assign(proto,{
        set(unit,value){
            let that = set.bind(this)(unit,value);
            let referDate = that._date||_referDate;
            let offset = convertTimeZone(referDate,that._timezone).getTime() - referDate.getTime();
            that._offset = Math.ceil(offset/60000)*60000;
            return that;
        },
        format(pattern = 'YYYY-MM-DD HH:mm:ss'){
            let that = this.clone();
            that._date.setTime(that._date.getTime()+that._offset);
            return format.bind(that)(pattern);
        }
    });
};
