import { isObject } from "../util/index.js";
const get = (target, key, receiver) => Reflect.get(target, key, receiver);
const set = (target, key, value, receiver) => {
    if (!has(target, key)) return true;
    if (get(target, key, receiver)) {
        return true;
    } else {
        Reflect.set(target, key, value, receiver);
    }
};
const has = (target, key) => Reflect.has(target, key);

/**
 *
 * @param {Object}target
 * @return Object
 */
export function readonly(target) {
    if (!isObject(target)) {
        console.warn(`${target} is not a Object!`);
        return target;
    }
    return new Proxy(target, {
        get,
        set,
        has,
    });
}


/**
 *
 * @param {Object}target
 * @return Object
 */
export function deepReadOnly(target) {
    if (!isObject(target)) {
        console.warn(`${target} is not a Object!`);
        return target;
    }
    for (const key of Object.keys(target)) {
        if (isObject(target[key])) {
            target[key] = deepReadOnly(target[key]);
        }
    }
    return readonly(target);
}
