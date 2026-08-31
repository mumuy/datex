import globalThis from "./globalThis.js";
if (!globalThis.structuredClone) {
    globalThis.structuredClone = function (value, options = {}) {
        const { transfer = [] } = options;
        const transferred = new Set(transfer);
        // visited 提升到最外层，贯穿整棵克隆树，跨层循环引用（A→B→A）也能识别
        const visited = new WeakMap();

        const clone = (value) => {
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
                const setClone = new Set();
                value.forEach((item) => {
                    setClone.add(transferred.has(item) ? item : clone(item));
                });
                return setClone;
            }
            // 处理 Map
            if (value instanceof Map) {
                const mapClone = new Map();
                value.forEach((v, k) => {
                    const key = transferred.has(k) ? k : clone(k);
                    const val = transferred.has(v) ? v : clone(v);
                    mapClone.set(key, val);
                });
                return mapClone;
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
                        error[key] = clone(value[key]);
                    }
                });
                return error;
            }
            // 处理普通对象和数组（先查 visited 识别循环引用，再递归复制）
            if (visited.has(value)) {
                return visited.get(value);
            }
            const cloned = Array.isArray(value) ? [] : {};
            visited.set(value, cloned);

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
                    cloned[key] = val;
                } else if (typeof val === 'object' && val !== null) {
                    cloned[key] = clone(val);
                } else {
                    cloned[key] = val;
                }
            });

            // 保留原型链
            Object.setPrototypeOf(cloned, Object.getPrototypeOf(value));
            return cloned;
        };
        return clone(value);
    };
}
export default globalThis.structuredClone;