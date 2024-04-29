import prototype from './prototype.js';

// 构造器
function datex(...argu){
    return new datex.prototype.init(...argu);
}

// 当前时间
datex.now = Date.now;

// 原型加载方法
datex.extend = function(loader){
    loader(datex,prototype);
};

// 无new实例化 - 类似于jQuery
datex.prototype = prototype;
prototype.init.prototype = prototype;

export default datex;
