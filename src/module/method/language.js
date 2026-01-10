/*
 * 本地化语言
*/
import en_us from './locale/en-us.js';
import zh_cn from './locale/zh-cn.js';
import zh_hk from './locale/zh-hk.js';
import {isString} from './utils/type.js';

export default function(datex,proto){
    let _langMap = {};
    [en_us,zh_cn,zh_hk].forEach(function(item){
        _langMap[item['name']] = item;
    });
    let _lang = globalThis?.navigator?.language.toLowerCase()||'en-us';
    if(_lang=='zh'){
        _lang = 'zh-cn';
    }

    Object.assign(datex,{
        setLanguage(lang,data={}){
            lang = lang.toLowerCase();
            _langMap[lang] = Object.assign(_langMap[lang]||{},data);
            return this;
        },
        switchLanguage(lang){
            _lang = lang.toLowerCase();
            return this;
        },
        getLanguage(){
            return _langMap[_lang]||_langMap['en-us'];
        },
        getLanguageCode(){
            return _lang;
        }
    });

    Object.assign(proto,{
        _langMap:{},
        _lang:null,
        setLanguage(lang,data={}){
            lang = lang.toLowerCase();
            this._langMap[lang] = Object.assign(this._langMap[lang]||{},data);
            return this;
        },
        switchLanguage(lang){
            this._lang = lang.toLowerCase();
            return this;
        },
        getLanguage(){
            return this._langMap[this._lang];
        },
        getLanguageCode(){
            return this._lang;
        }
    });

    proto.onInit(function(){
        this._langMap = Object.assign(this._langMap,_langMap);
        this._lang = _lang;
    });

    // 重写
    let format = proto.format;
    Object.assign(proto,{
        format(pattern = 'YYYY-MM-DD HH:mm:ss'){
            if(isString(pattern)){
                let _ = this;
                let $ = this.toObject();
                let languageMap = datex.getLanguage()||this.getLanguage();
                let map = {};
                map['MMMM'] = languageMap['format']['MMMM'][$.month-1];
                map['MMM'] = languageMap['format']['MMM'][$.month-1];
                map['Do'] = languageMap['format']['Do'][$.day-1];
                map['WWW'] = languageMap['format']['WWW'][$.week];
                map['WW'] = languageMap['format']['WW'][$.week];
                return pattern.replace(/Y+|M+|Do|D+|H+|h+|m+|s+|S+|Z+|A|a|X|x|Q|W+/g,function(key){
                    if(map[key]){
                        return map[key];
                    }else{
                        return format.bind(_)(key);
                    }
                });
            }
            return format.bind(this)(pattern);
        }
    });
};
