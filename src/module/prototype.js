import {periodKey,periodValue} from './method/config/period.js';

function isObject(value){
    return value != null && (typeof value == 'object' || typeof value == 'function');
}

let taskQueue = [];

export default {
    _date:null,
    init:function(...param){
        if(param.length&&param[0]){
            if(Object.getPrototypeOf(param[0])==Object.getPrototypeOf(this)){
                return param[0];
            }else if(param[0] instanceof Date){
                this._date = param[0];
            }else{
                if(Array.isArray(param[0])){
                    param = periodValue.map((value,index)=>(param[0][index]||value));
                }else if(isObject(param[0])){
                    param = periodValue.map((value,index)=>(param[0][periodKey[index]]||value));
                }
                if(param.length==1&&typeof param[0]=='string'){
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
                if(param.length>=3){
                    param[1]--;
                }
                this._date = new Date(...param);
                if(param.length>=2&&!isNaN(param[0])&&param[0]<100){
                    this._date.setFullYear(param[0]);
                }
            }
        }else{
            this._date = new Date();
        }

        let _ = this;
        taskQueue.forEach(function(task){
            task.bind(_)(...param);
        });
        return this;
    },
    onInit:function(callback){
        taskQueue.push(callback);
    }
};
