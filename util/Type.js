export const isFunction = (/** @type {any} */ target) => target instanceof Function;
export const isNotFunction = (/** @type {any} */ target) => !isFunction(target);
export const isObject = (/** @type {any} */ target) => target instanceof Object;
export const isArray = Array.isArray;
export const isNotObject = (/** @type {any} */ target) => !isObject(target) && isNotArray(target);
export const isNotArray = (/** @type {any} */ target) => !isArray(target);
export const isString = (/** @type {any} */ target) => typeof target === "string";
export const isNotString = (/** @type {any} */ target) => !isString(target);
export const isNull = (/** @type {any} */ target) =>
    target === undefined || target === null || target === (void 0);
export const isNotNull = (/** @type {any} */ target) => !isNull(target);
export const isMustache = value => {
    return /{{(.+?)}}/gi.test(value) || /\${(.+?)}/gi.test(value);
}
