import globalThis from "./globalThis.js";

if (!globalThis.structuredClone) {
    globalThis.structuredClone = function (value, options = {}) {
        const { transfer = [] } = options;
        const transferred = new Set(transfer);
        
        // 处理基本类型和 null
        if (value === null || typeof value !== 'object') {
            return value;
        }
        
        // 处理 Date
        if (value instanceof Date) {
            return new Date(value.getTime());
        }
        
        // 处理 RegExp
        if (value instanceof RegExp) {
            return new RegExp(value);
        }
        
        // 处理 Set
        if (value instanceof Set) {
            const clone = new Set();
            value.forEach((item) => {
                if (transferred.has(item)) {
                    clone.add(item);
                } else {
                    clone.add(globalThis.structuredClone(item, options));
                }
            });
            return clone;
        }
        
        // 处理 Map
        if (value instanceof Map) {
            const clone = new Map();
            value.forEach((v, k) => {
                const key = transferred.has(k) ? k : globalThis.structuredClone(k, options);
                const val = transferred.has(v) ? v : globalThis.structuredClone(v, options);
                clone.set(key, val);
            });
            return clone;
        }
        
        // 处理 ArrayBuffer（支持 transfer）
        if (value instanceof ArrayBuffer) {
            if (transferred.has(value)) {
                transferred.delete(value);
                return value;
            }
            return value.slice();
        }
        
        // 处理 TypedArray
        if (ArrayBuffer.isView(value)) {
            if (transferred.has(value.buffer)) {
                transferred.delete(value.buffer);
                return value;
            }
            return new value.constructor(value);
        }
        
        // 处理 DOMException（特殊内置对象）
        if (value instanceof DOMException) {
            return new DOMException(value.message, value.name);
        }
        
        // 处理 Error（保留错误类型和属性）
        if (value instanceof Error) {
            const error = new value.constructor(value.message);
            Object.getOwnPropertyNames(value).forEach((key) => {
                if (key !== 'message' && key !== 'name') {
                    error[key] = globalThis.structuredClone(value[key], options);
                }
            });
            return error;
        }
        
        // 处理普通对象和数组
        const clone = Array.isArray(value) ? [] : {};
        
        // 处理循环引用
        const visited = new WeakMap();
        visited.set(value, clone);
        
        // 复制所有属性（包括 Symbol 键）
        const allKeys = [...Object.getOwnPropertyNames(value), ...Object.getOwnPropertySymbols(value)];
        allKeys.forEach((key) => {
            const desc = Object.getOwnPropertyDescriptor(value, key);
            if (desc && !desc.writable && !desc.configurable) {
                // 只读且不可配置的属性无法复制，跳过
                return;
            }
            
            const val = value[key];
            if (transferred.has(val)) {
                clone[key] = val;
            } else if (typeof val === 'object' && val !== null) {
                if (visited.has(val)) {
                    // 处理循环引用
                    clone[key] = visited.get(val);
                } else {
                    clone[key] = globalThis.structuredClone(val, options);
                    visited.set(val, clone[key]);
                }
            } else {
                clone[key] = val;
            }
        });
        
        // 保留原型链
        Object.setPrototypeOf(clone, Object.getPrototypeOf(value));
        
        return clone;
    };
}

export default globalThis.structuredClone;