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
                }
                if(params.length==1&&isString(params[0])){
                    let matchs1 = params[0].match(/(\d{1,4})[\-\/](\d{1,2})[\-\/](\d{1,2})([\sT](\d{1,2})?:(\d{1,2})?(:(\d{1,2}))?(\.(\d{1,3}))?)?/);
                    let matchs2 = params[0].match(/(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{3,4})([\sT](\d{1,2})?:(\d{1,2})?(:(\d{1,2}))?(\.(\d{1,3}))?)?/);
                    let matchs3 = params[0].match(/^([12]\d{3})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?(\d{1,3})?/);
                    if(matchs1&&!matchs2){
                        params = [1,2,3,5,6,8,10].map(function(i,index){
                            return +(matchs1[i]||periodValue[index]);
                        });
                    }else if(matchs2){
                        params = [3,1,2,5,6,8,10].map(function(i,index){
                            return +(matchs2[i]||periodValue[index]);
                        });
                    }else if(matchs3){
                        params = [1,2,3,4,5,6,7].map(function(i,index){
                            return +(matchs3[i]||periodValue[index]);
                        });
                    }
                }
                // 参数修复
                if(params.length>=3){
                    params[1]--;
                }
                // 字符串输入做字段范围校验（month 1-12, day 1-31, hour 0-23, minute/second 0-59）
                const isInvalid = isString(argu[0])&&(function(){
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
        }else{
            this._date = new Date();
        }
        if(this._offset){
            this._date.setTime(this._date.getTime()-this._offset);
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
