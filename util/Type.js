export const isFunction = target => target instanceof Function;
export const isNotFunction = target => !isFunction(target);
export const isObject = target => target instanceof Object;
export const isArray = Array.isArray;
export const isNotObject = target => !isObject(target);
export const isNotArray = target => !isArray(target);
export const isString = target => typeof target === "string";
export const isNotString = target => !isString(target);
export const isNull = target =>
    target === void 0 || target === null || target === undefined;
export const isNotNull = target => !isNull(target);
