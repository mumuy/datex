var langMap = {};
langMap['en-US'] = {
    'MMM':['Jan.','Feb.','Mar.','Apr.','May.','Jun.','Jul.','Aug.','Sept.','Oct.','Nov.','Dec.'],
    'MMMM':['January','February','March','April','May','June','July','August','September','October','November','December'],
    'Do':['1st','2st','3st','4st','5st','6st','7st','8st','9st','10st','11st','12st','13st','14st','15st','16st','17st','18st','19st','20st','21st','22st','23st','24st','25st','26st','27st','28st','29st','30st','31st'],
    'W':['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    'w':['Sun.','Mon.','Tues.','Wed.','Thur.','Fri.','Sat.'],
};
langMap['zh-CN'] = {
    'MMM':['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    'MMMM':['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
    'Do':['1日','2日','3日','4日','5日','6日','7日','8日','9日','10日','11日','12日','13日','14日','15日','16日','17日','18日','19日','20日','21日','22日','23日','24日','25日','26日','27日','28日','29日','30日','31日'],
    'W':['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
    'w':['周日','周一','周二','周三','周四','周五','周六'],
};
var language = langMap['en-US'];
if(typeof self!='undefined'&&self.navigator){
    language = langMap[self.navigator.language];
}

function DateX(){
    return new DateX.prototype.init(...arguments);
}
DateX.prototype = {
    _date:null,
    init:function(){
        if(arguments.length>=3){
            arguments[1]--;
        }
        this._date = new Date(...arguments);
        return this;
    },
    getTime(){
        return this._date.getTime();
    },
    clone(){
        return DateX(this.getTime());
    },
    toDate(){
        return this._date;
    },
    toObject(){
        var _ = this._date;
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
        }
    },
    set(unit,value){
        var _ = this._date
        var $ = this.toObject();
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
                var diff = $.week-value;
                _.setDate($.day-diff);
                break;
        }
        return this;
    },
    get(unit){
        var $ = this.toObject();
        return $[unit];
    },
    change(unit,value){
        var $ = this.toObject();
        return this.set(unit,$[unit]+value);
    },
    format(pattern = 'YYYY-MM-DD HH:mm:ss'){
        var _ = this._date;
        var $ = this.toObject();
        var match = _.toTimeString().match(/GMT([\+\-])(\d{2})(\d{2})/);
        var map = {
            'YYYY':''+$.year,
            'YY':(''+$.year).padStart(2,'0'),
            'MM':(''+$.month).padStart(2,'0'),
            'M':''+$.month,
            'DD':(''+$.day).padStart(2,'0'),
            'D':''+$.day,
            'HH':(''+$.hour).padStart(2,'0'),
            'H':''+$.hour,
            'mm':(''+$.minute).padStart(2,'0'),
            'm':''+$.minute,
            'ss':(''+$.second).padStart(2,'0'),
            's':''+$.second,
            'S':''+(~~(($.millsecond%1000)/100)),
            'SS':''+(~~(($.millsecond%1000)/10)),
            'SSS':''+($.millsecond%1000),
            'Z':match[1]+match[2]+':'+match[3],
            'ZZ':match[1]+match[2]+match[3],
            'A':['AM','PM'][~~$.hour%12],
            'a':['am','pm'][~~$.hour%12],
            'X':$.timestamp/1000,
            'x':$.timestamp,
            'Q':''+(~~($.month/3)),
        };
        map['MMM'] = language['MMM'][$.month-1];
        map['MMMM'] = language['MMMM'][$.month-1];
        map['Do'] = language['Do'][$.day-1];
        map['W'] = language['W'][$.week];
        map['w'] = language['w'][$.week];
        return pattern.replace(/Y+|M+|D+|H+|h+|m+|s+|S+|Z+|Do|A|a|X|x|Q|W|w/g,function(key){
            return map[key]||'';
        });
    },
    diff(unit,that){
        if(typeof that=='undefined'){
            that = DateX();
        }else if(!(that instanceof DateX)){
            that = DateX(that);
        }
        if(isNaN(that.getTime())){
            return false;
        }
        var timestamp = this.getTime()-that.getTime();
        var diffMap = {
            'day':86400000,
            'hour':3600000,
            'minute':60000,
            'second':1000,
            'millsecond':1,
            'timestamp':1
        };
        var value = 0;
        if(diffMap[unit]){
            value = ~~(timestamp/diffMap[unit]);
        }else if(unit=='month'){
            var this_month = 12*(this.get('year')-1)+this.get('month');
            var that_month = 12*(that.get('year')-1)+that.get('month');
            value = this_month -that_month;
        }else if(unit=='year'){
            value = this.get('year') - that.get('year');
        }
        return value;
    },
    startOf(unit){
        var $ = this.toObject();
        var that = null;
        switch (unit) {
            case 'year':
                that = DateX($.year,1,1,0,0,0,0);
                break;
            case 'month':
                that = DateX($.year,$.month,1,0,0,0,0);
                break;
            case 'day':
                that = DateX($.year,$.month,$.day,0,0,0,0);
                break;
            case 'hour':
                that = DateX($.year,$.month,$.day,$.hour,0,0,0);
                break;
            case 'minute':
                that = DateX($.year,$.month,$.day,$.hour,$.minute,0,0);
                break;
            case 'second':
                that = DateX($.year,$.month,$.day,$.hour,$.minute,$.second,0);
                break;
            case 'millsecond':
            case 'timestamp':
                that = this.clone();
                break;
            case 'week':
                that = DateX($.year,$.month,$.day-$.week,0,0,0,0);
                break;
        }
        return that;
    },
    endOf(unit){
        var $ = this.toObject();
        return this.startOf(unit).change(unit,unit=='week'?7:1).change('millsecond',-1);
    }
};
DateX.prototype.init.prototype = DateX.prototype;

export default DateX;
