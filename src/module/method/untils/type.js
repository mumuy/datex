export function isObject(value){
    return value != null && (typeof value == 'object' || typeof value == 'function');
}

export function isNumber(value){
    return typeof value==='number'&&!isNaN(value);
}

export function isString(value){
    return (typeof value=='string');
}

export function isArray(value){
    return Array.isArray(value);
}

export function isFunction(value){
    return (typeof value=='function');
}

export function isDate(value){
    return (value instanceof Date);
}
