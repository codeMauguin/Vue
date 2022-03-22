export const isFunction = (/** @type {any} */
                           target) => target instanceof Function;
export const isNotFunction = (/** @type {any} */
                              target) => !isFunction(target);
export const isObject = (/** @type {any} */
                         target) => target instanceof Object;
export const isArray = Array.isArray;
/**
 *
 * @param target
 * @return {boolean}
 */
export const isNotObject = (/** @type {any} */
                            target) => !isObject(target) && isNotArray(target);
/**
 *
 * @param target
 * @return {boolean}
 */
export const isNotArray = (/** @type {any} */
                           target) => !isArray(target);
export const isString = (/** @type {any} */
                         target) => typeof target === "string";
/**
 *
 * @param target
 * @return {boolean}
 */
export const isNotString = (/** @type {any} */
                            target) => !isString(target);
/**
 *
 * @param target
 * @return {boolean}
 */
export const isNull = (/** @type {any} */
                       target) => target === (void 0) || target === null || target === undefined;
/**
 *
 * @param target
 * @return {boolean}
 */
export const isNotNull = (/** @type {any} */
                          target) => !isNull(target);
/**
 *
 * @return {boolean}
 * @param value
 */
export const isMustache = value => {
    return /{{(.+?)}}/gi.test(value) || /\${(.+?)}/gi.test(value);
}

export const cloneClass = (target,
                           sourceClass) => {
    const clone = new sourceClass();
    return Object.assign(clone,
                         target);
}
/**
 *
 * @param {Array} target
 * @param {Array} source
 * @param compare
 * @return {Object}
 */
export const updateArray = (target,
                            source,
                            compare = (a,
                                       b) => a === b) => {
    if (!isArray(target) || !isArray(source)) {
        return null;
    }
    const add = [], del = [];
    let old_index = 0, new_index = 0;
    P: while (old_index < target.length && new_index < source.length) {
        if (target[old_index] === null) {
            old_index++;
            continue;
        }
        for (let i = old_index; i < target.length; ++i) {
            if (compare(target[i],
                        source[new_index])) {
                target[i] = null;
                old_index++;
                new_index++;
                continue P;
            }
        }
        add.push(source[new_index++]);
    }
    target.filter((e) => e !== null)
          .forEach((key) => del.push(key));
    if (new_index++ < source.length) {
        for (; new_index < source.length; ++new_index) {
            add.push(source[new_index]);
        }
    }
    return {del, add};
}

export const updateObject = (target,
                             source) => {
    if (isNull(target) || isNull(source)) return;
    const update = [], del = [], add = [];
    const oldKeys = Reflect.ownKeys(target);
    const newKeys = Reflect.ownKeys(source);
    let oldKey_index = 0, newKey_index = 0, oldKey = oldKeys[oldKey_index],
        newKey = newKeys[newKey_index];
    P: while (oldKey_index < oldKeys.length && newKey_index < newKeys.length) {
        if (oldKey === null) {
            oldKey = oldKeys[++oldKey_index];
            continue;
        }
        for (let i = oldKey_index; i < oldKeys.length; ++i) {
            oldKey = oldKeys[i];
            if (oldKey === newKey) {
                if (target[oldKey] !== source[newKey]) {
                    update.push([newKey, source[newKey]]);
                }
                oldKeys[i] = null;
                newKey = newKeys[++newKey_index];
                continue P;
            }
        }
        add.push([newKey, source[newKey]]);
        newKey = newKeys[++newKey];
    }
    oldKeys
        .filter((e) => e !== null)
        .forEach((key) => {
            del.push(key);
        });
    if (newKey_index++ < newKeys.length) {
        for (; newKey_index < newKeys.length; ++newKey_index) {
            add.push([newKeys[newKey_index], source[newKeys[newKey_index]]]);
        }
    }
    return {del, add, update};
}
