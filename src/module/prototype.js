import {periodKey,periodValue} from './method/map/period';

function isObject(value){
    return value != null && (typeof value == 'object' || typeof value == 'function');
}

let taskQueue = [];

export default {
    _date:null,
    init:function(...argu){
        if(argu.length){

            if(Object.getPrototypeOf(argu[0])==Object.getPrototypeOf(this)){
                return argu[0];
            }else if(argu[0] instanceof Date){
                this._date = argu[0];
            }else{
                if(Array.isArray(argu[0])){
                    argu = periodValue.map((value,index)=>(argu[0][index]||value));
                }else if(isObject(argu[0])){
                    argu = periodValue.map((value,index)=>(argu[0][periodKey[index]]||value));
                }
                if(argu.length==1&&typeof argu[0]=='string'){
                    let matchs1 = argu[0].match(/(\d{1,4})[\-\/](\d{1,2})[\-\/](\d{1,2})([\sT](\d{1,2})?:(\d{1,2})?(:(\d{1,2}))?(\.(\d{1,3}))?)?/);
                    let matchs2 = argu[0].match(/(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{3,4})([\sT](\d{1,2})?:(\d{1,2})?(:(\d{1,2}))?(\.(\d{1,3}))?)?/);
                    let matchs3 = argu[0].match(/^([12]\d{3})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?(\d{1,3})?/);
                    if(matchs1&&!matchs2){
                        argu = [1,2,3,5,6,8,10].map(function(i,index){
                            return +(matchs1[i]||periodValue[index]);
                        });
                    }else if(matchs2){
                        argu = [3,1,2,5,6,8,10].map(function(i,index){
                            return +(matchs2[i]||periodValue[index]);
                        });
                    }else if(matchs3){
                        argu = [1,2,3,4,5,6,7].map(function(i,index){
                            return +(matchs3[i]||periodValue[index]);
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
