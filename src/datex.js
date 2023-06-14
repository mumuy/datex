let _langMap = {};
_langMap['en-us'] = {
    'MMM':['Jan.','Feb.','Mar.','Apr.','May.','Jun.','Jul.','Aug.','Sept.','Oct.','Nov.','Dec.'],
    'MMMM':['January','February','March','April','May','June','July','August','September','October','November','December'],
    'Do':['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th','13th','14th','15th','16th','17th','18th','19th','20th','21st','22nd','23rd','24th','25th','26th','27th','28th','29th','30th','31st'],
    'WW':['Sun.','Mon.','Tues.','Wed.','Thur.','Fri.','Sat.'],
    'WWW':['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
};
_langMap['zh-cn'] = {
    'MMM':['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    'MMMM':['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
    'Do':['1日','2日','3日','4日','5日','6日','7日','8日','9日','10日','11日','12日','13日','14日','15日','16日','17日','18日','19日','20日','21日','22日','23日','24日','25日','26日','27日','28日','29日','30日','31日'],
    'WW':['周日','周一','周二','周三','周四','周五','周六'],
    'WWW':['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
};
let _lang = 'en-us';
if(typeof self!='undefined'&&self.navigator){
    _lang = self.navigator.language.toLowerCase();
    if (!(_lang in _langMap)) {
        _lang = 'en-us'
    }
}
let _timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let _offset = 0;
const period = ['year','month','day','hour','minute','second','millsecond'];
const initTime = [1970,1,1,0,0,0,0];
const convertTimeZone = (date, timeZone) => {return new Date(date.toLocaleString('en-US', { timeZone }))};

function datex(...argu){
    return new datex.prototype.init(...argu);
}
function getInstance(that){
    return that instanceof datex?that:datex(that);
}
function isObject(value){
    return value != null && (typeof value == 'object' || typeof value == 'function');
}

datex.setLanguage = function(lang,data={}){
    _langMap[lang] = Object.assign(_langMap[lang]||{},data);
    return this;
};
datex.switchLanguage = function(lang){
    _lang = lang;
    return this;
};
datex.now = Date.now;
datex.supportedTimezones =  typeof Intl!='undefined'&&Intl.supportedValuesOf?Intl.supportedValuesOf('timeZone'):[];
datex.switchTimezone = function(timezone){
    _timezone = timezone;
    _offset = convertTimeZone(new Date('1970/1/1'),_timezone).getTime() - (new Date('1970/1/1')).getTime();
};
datex.getTimezone = function(){
    return _timezone;
};
datex.getTimezoneOffset = function(){
    return (new Date).getTimezoneOffset() - _offset/60000;
};

datex.prototype = {
    _date:null,
    _langMap:{},
    _lang:null,
    _timezone:null,
    _offset:0,
    init:function(...argu){
        if(argu.length){
            if(argu[0] instanceof Date){
                this._date = argu[0];
            }else{
                if(Array.isArray(argu[0])){
                    argu = initTime.map((value,index)=>(argu[0][index]||value));
                }else if(isObject(argu[0])){
                    argu = initTime.map((value,index)=>(argu[0][period[index]]||value));
                }
                if(argu.length==1&&typeof argu[0]=='string'){
                    let matchs1 = argu[0].match(/(\d{1,4})[\-\/](\d{1,2})[\-\/](\d{1,2})([\sT](\d{1,2})?:(\d{1,2})?(:(\d{1,2}))?(\.(\d{1,3}))?)?/);
                    let matchs2 = argu[0].match(/(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{3,4})([\sT](\d{1,2})?:(\d{1,2})?(:(\d{1,2}))?(\.(\d{1,3}))?)?/);
                    let matchs3 = argu[0].match(/^([12]\d{3})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?(\d{1,3})?/);
                    if(matchs1&&!matchs2){
                        argu = [1,2,3,5,6,8,10].map(function(i,index){
                            return +(matchs1[i]||initTime[index]);
                        });
                    }else if(matchs2){
                        argu = [3,1,2,5,6,8,10].map(function(i,index){
                            return +(matchs2[i]||initTime[index]);
                        });
                    }else if(matchs3){
                        argu = [1,2,3,4,5,6,7].map(function(i,index){
                            return +(matchs3[i]||initTime[index]);
                        });
                    }
                }
                if(argu.length>=3){
                    argu[1]--;
                }
                this._date = new Date(...argu);
                if(argu.length>=2&&!isNaN(argu[0])&&argu[0]<100){
                    this._date.setFullYear(argu[0]);
                }
            }
            if(_offset){
                this._date.setTime(this._date.getTime()-_offset);
            }
        }else{
            this._date = new Date();
        }
        return this;
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
        return period.map(name=>$[name]);
    },
    toString(){
        return this._date.toString();
    },
    toISOString(){
        return this._date.toISOString();
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
    get(unit){
        let $ = this.toObject();
        return $[unit];
    },
    change(unit,value){
        let $ = this.toObject();
        return this.set(unit,$[unit]+value);
    },
    format(pattern = 'YYYY-MM-DD HH:mm:ss'){
        let that = this.clone();
        let offset = this._offset||_offset;
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
        let langMap = Object.assign({},_langMap,this._langMap);
        let language = langMap[this._lang||_lang];
        map['MMM'] = language['MMM'][$.month-1];
        map['MMMM'] = language['MMMM'][$.month-1];
        map['Do'] = language['Do'][$.day-1];
        map['WW'] = language['WW'][$.week];
        map['WWW'] = language['WWW'][$.week];
        return pattern.replace(/Y+|M+|D+|H+|h+|m+|s+|S+|Z+|Do|A|a|X|x|Q|W+/g,function(key){
            return map[key]||'';
        });
    },
    startOf(unit){
        let $ = this.toObject();
        let that = null;
        let index = period.indexOf(unit)+1;
        let dateSet = this.toArray();
        let initSet = initTime.slice(index);
        dateSet.splice(index,initSet.length,...initSet);
        if(unit=='timestamp'){
            that = this.clone();
        }else if(unit=='week'){
            that = datex($.year,$.month,$.day-$.week,0,0,0,0);
        }else{
            that = datex(...dateSet);
        }
        return that;
    },
    endOf(unit){
        return this.startOf(unit).change(unit,unit=='week'?7:1).change('millsecond',-1);
    },
    diffWith(that,unit){
        that = getInstance(that);
        if(!that.isValid()){
            return false;
        }
        let diffMap = {
            'day':8.64e7,
            'hour':3.6e6,
            'minute':6e4,
            'second':1000,
            'millsecond':1
        };
        let timestamp = this.getTime()-that.getTime();
        let value = 0;
        if(unit){
            if(diffMap[unit]){
                value = ~~(timestamp/diffMap[unit]);
            }else if(unit=='month'){
                let this_month = 12*(this.get('year')-1)+this.get('month');
                let that_month = 12*(that.get('year')-1)+that.get('month');
                value = this_month -that_month;
                if(value<0&&this.get('day')>that.get('day')){
                    value+=1;
                }else if(value>0&&this.get('day')<that.get('day')){
                    value-=1;
                }
            }else if(unit=='year'){
                value = this.get('year') - that.get('year');
                if(value<0&&(this.get('month')>that.get('month')||this.get('month')==that.get('month')&&this.get('day')>that.get('day'))){
                    value+=1;
                }else if(value>0&&(this.get('month')<that.get('month')||this.get('month')==that.get('month')&&this.get('day')<that.get('day'))){
                    value-=1;
                }
            }
            return value;
        }else{
            let clone = this.clone();
            let hash = {};
            period.forEach(function(unit){
                hash[unit] = clone.diffWith(that,unit);
                clone.set(unit,that.get(unit));
            });
            return hash;
        }
    },
    isBefore(that,unit = 'timestamp'){
        that = getInstance(that);
        return this.get(unit)<that.get(unit);
    },
    isAfter(that,unit = 'timestamp'){
        that = getInstance(that);
        return this.get(unit)>that.get(unit);
    },
    isSame(that,unit = 'timestamp'){
        that = getInstance(that);
        return this.get(unit)==that.get(unit);
    },
    isBetween(startDate,endDate,unit = 'timestamp'){
        startDate = getInstance(startDate);
        endDate = getInstance(endDate);
        return this.get(unit)>startDate.get(unit)&&this.get(unit)<endDate.get(unit);
    },
    setLanguage(lang,data={}){
        this._langMap[lang] = Object.assign(this._langMap[lang]||{},data);
        return this;
    },
    switchLanguage(lang){
        this._lang = lang;
        return this;
    },
    switchTimezone(timezone){
        this._timezone = timezone;
        this._offset = convertTimeZone(new Date('1970/1/1'),this._timezone).getTime() - (new Date('1970/1/1')).getTime();
        return this;
    },
    getTimezone(){
        return this._timezone||_timezone;
    },
    getTimezoneOffset(){
        return this._date.getTimezoneOffset() - (this._offset||_offset)/60000;
    },
    isValid(){
        return !isNaN(this.getTime());
    }
};
datex.prototype.init.prototype = datex.prototype;

export default datex;
