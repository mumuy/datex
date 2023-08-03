export default function(datex,proto){
    let _timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let _offset = 0;

    const convertTimeZone = (date, timeZone) => {return new Date(date.toLocaleString('en-US', { timeZone }))};

    Object.assign(datex,{
        supportedTimezones:(typeof Intl!='undefined'&&Intl.supportedValuesOf?Intl.supportedValuesOf('timeZone'):[]),
        switchTimezone(timeZone){
            _timezone = timeZone;
            _offset =  convertTimeZone(new Date('1970/1/1'),_timezone).getTime() - (new Date('1970/1/1')).getTime();
            return this;
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
            this._offset = convertTimeZone(new Date('1970/1/1'),this._timezone).getTime() - (new Date('1970/1/1')).getTime();
            return this;
        },
        getTimezoneOffset(){
            return this._date.getTimezoneOffset() - this._offset/60000;
        },
        getTimezone(){
            return this._timezone;
        }
    });

    proto.onInit(function(...argu){
        this._timezone = _timezone;
        this._offset = _offset;
        if(argu.length){
            if(argu[0] instanceof Date){
            }else if(argu[0] instanceof datex){
            }else if(argu.length==1&&typeof argu[0]=='number'){
            }else if(_offset){
                this._date.setTime(this._date.getTime()-_offset);
            }
        }
    });

    // 重写
    let format = proto.format;
    Object.assign(proto,{
        format(pattern = 'YYYY-MM-DD HH:mm:ss'){
            let that = this.clone();
            that._date.setTime(that._date.getTime()+that._offset);
            return format.bind(that)(pattern);
        }
    });
};
