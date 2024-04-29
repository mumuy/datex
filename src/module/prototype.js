import {periodKey,periodValue} from './method/config/period.js';
import {isObject,isNumber,isString,isArray,isDate} from './method/untils/type.js';

let taskQueue = [];

export default {
    _date:null,
    init:function(...argu){
        let param = argu.slice(0);
        if(param.length&&param[0]){
            if(Object.getPrototypeOf(param[0])==new.target){
                return param[0];
            }else if(isDate(param[0])){
                this._date = param[0];
            }else{
                // 参数映射
                if(isArray(param[0])){
                    param = periodValue.map((value,index)=>(param[0][index]||value));
                }else if(isObject(param[0])){
                    param = periodValue.map((value,index)=>(param[0][periodKey[index]]||value));
                }
                if(param.length==1&&isString(param[0])){
                    let matchs1 = param[0].match(/(\d{1,4})[\-\/](\d{1,2})[\-\/](\d{1,2})([\sT](\d{1,2})?:(\d{1,2})?(:(\d{1,2}))?(\.(\d{1,3}))?)?/);
                    let matchs2 = param[0].match(/(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{3,4})([\sT](\d{1,2})?:(\d{1,2})?(:(\d{1,2}))?(\.(\d{1,3}))?)?/);
                    let matchs3 = param[0].match(/^([12]\d{3})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?(\d{1,3})?/);
                    if(matchs1&&!matchs2){
                        param = [1,2,3,5,6,8,10].map(function(i,index){
                            return +(matchs1[i]||periodValue[index]);
                        });
                    }else if(matchs2){
                        param = [3,1,2,5,6,8,10].map(function(i,index){
                            return +(matchs2[i]||periodValue[index]);
                        });
                    }else if(matchs3){
                        param = [1,2,3,4,5,6,7].map(function(i,index){
                            return +(matchs3[i]||periodValue[index]);
                        });
                    }
                }
                // 参数修复
                if(param.length>=3){
                    param[1]--;
                }
                // 初始化
                this._date = new Date(...param);
                if(param.length>=2&&isNumber(param[0])&&param[0]<100){
                    this._date.setFullYear(param[0]);
                }
            }
        }else{
            this._date = new Date();
        }

        let _ = this;
        taskQueue.forEach(function(task){
            task.bind(_)(...argu);
        });
        return this;
    },
    onInit:function(callback){
        taskQueue.push(callback);
    }
};
