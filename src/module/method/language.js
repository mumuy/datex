import en_us from './locale/en-us';
import zh_cn from './locale/zh-cn';

export default function(datex,proto){
    let _langMap = {};
    _langMap['en-us'] = en_us;
    _langMap['zh-cn'] = zh_cn;
    let _lang = 'en-us';
    if(typeof self!='undefined'&&self.navigator){
        _lang = self.navigator.language.toLowerCase();
        if (!_langMap[_lang]) {
            _lang = 'en-us';
        }
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
            return _langMap[_lang];
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
            let that = this.clone();
            let $ = that.toObject();
            let language = datex.getLanguage()||this.getLanguage();
            let map = {};
            map['MMM'] = language['MMM'][$.month-1];
            map['MMMM'] = language['MMMM'][$.month-1];
            map['Do'] = language['Do'][$.day-1];
            map['WW'] = language['WW'][$.week];
            map['WWW'] = language['WWW'][$.week];
            for (let key in map) {
                pattern = pattern.replace(key,map[key]||'');
            }
            return format.bind(this)(pattern);
        }
    });
};
