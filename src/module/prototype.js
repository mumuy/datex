import {periodKey,periodValue} from './method/config/period.js';
import {isObject,isNumber,isString,isArray,isDate} from './method/utils/type.js';

let taskQueue = [];

export default {
    _date:null,
    parse:function(...argu){
        let params = argu.slice(0);
        if(params.length&&(params[0]||params[0]===0)){
            if(Object.getPrototypeOf(params[0])==Object.getPrototypeOf(this)){
                this._date = params[0].toDate();
                return params[0];
            }else if(isDate(params[0])){
                this._date = params[0];
            }else{
                // 参数映射
                if(isArray(params[0])){
                    params = periodValue.map((value,index)=>(params[0][index]!=null?params[0][index]:value));
                }else if(isObject(params[0])){
                    params = periodValue.map((value,index)=>(params[0][periodKey[index]]!=null?params[0][periodKey[index]]:value));
                }else if(params.length==1&&isString(params[0])){
                    const timeSuffixRegex = /(?:[\sT](?<hour>\d{1,2})?:(?<minute>\d{1,2})?(?::(?<second>\d{1,2}))?(?:\.(?<millisecond>\d{1,3}))?)?/;
                    // YYYY-MM-DD 或 YYYY/MM/DD
                    const reg1 = new RegExp(`^(?<year>\\d{1,4})[-/](?<month>\\d{1,2})[-/](?<day>\\d{1,2})${timeSuffixRegex.source}`);
                    // MM-DD-YYYY 或 MM/DD/YYYY
                    const reg2 = new RegExp(`^(?<month>\\d{1,2})[-/](?<day>\\d{1,2})[-/](?<year>\\d{3,4})${timeSuffixRegex.source}`);
                    // YYYYMMDDHHmmssSSS
                    const reg3 = /^(?<year>[12]\d{3})(?<month>\d{2})(?<day>\d{2})(?<hour>\d{2})?(?<minute>\d{2})?(?<second>\d{2})?(?<millisecond>\d{1,3})?/;

                    let matchs1 = params[0].match(reg1);
                    let matchs2 = params[0].match(reg2);
                    let matchs3 = params[0].match(reg3);
                    if (matchs1 && !matchs2) {
                        const groups = matchs1.groups;
                        params = periodKey.map((key, index) => +(groups[key] || periodValue[index]));
                    } else if (matchs2) {
                        const groups = matchs2.groups;
                        params = periodKey.map((key, index) => +(groups[key] || periodValue[index]));
                    } else if (matchs3) {
                        const groups = matchs3.groups;
                        params = periodKey.map((key, index) => +(groups[key] || periodValue[index]));
                    }
                }
                // 参数修复
                if(params.length>=3){
                    params[1]--;
                }
                // 字符串输入做字段范围校验（month 1-12, day 1-31, hour 0-23, minute/second 0-59）
                const isInvalid = (function(){
                    if(params.length<3){
                        return false;
                    }
                    const [year = 0, month = 0, day = 0, hour = 0, minute = 0, second = 0, millisecond = 0] = params;
                    const date = new Date(year, month, day, hour, minute, second, millisecond);
                    return (
                        date.getFullYear() !== year ||
                        date.getMonth() !== month ||
                        date.getDate() !== day ||
                        date.getHours() !== hour ||
                        date.getMinutes() !== minute ||
                        date.getSeconds() !== second ||
                        date.getMilliseconds() !== millisecond
                    );
                })();
                if(isInvalid){
                    this._date = new Date(''); // 无效输入，置 Invalid Date
                }else{
                    // 初始化
                    this._date = new Date(...params);
                    if(params.length>=2&&isNumber(params[0])&&params[0]<100){
                        this._date.setFullYear(params[0]);
                    }
                }
            }
            if(this._offset){
                this._date.setTime(this._date.getTime()-this._offset);
            }
        }else{
            this._date = new Date();
        }
        return this;
    },
    init:function(...argu){
        this.parse(...argu);

        // 初始化
        let _ = this;
        taskQueue.forEach(function(task){
            task.bind(_)(...argu);
        });
        return this;
    },
    onInit(callback){
        taskQueue.push(callback);
    }
};
