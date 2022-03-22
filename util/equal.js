import {isArray, isObject} from "./";

/**
 * @param {any} target
 * @param {any} source
 * @return {boolean}
 */
export default function equal(target,
                              source) {
    return (Object.is(target,
                      source) || (isArray(target) && isArray(source) ? target.length === source.length && target.every((t,
                                                                                                                        i) => equal(t,
                                                                                                                                    source[i])) : (target instanceof Date && source instanceof Date) ? Object.is(target.getTime(),
                                                                                                                                                                                                                 source.getTime()) : (isObject(target) && isObject(source)) ? Object.keys(target).length === Object.keys(source).length && Object.keys(target)
                                                                                                                                                                                                                                                                                                                                                 .every(k => equal(target[k],
                                                                                                                                                                                                                                                                                                                                                                   source[k])) : false));
}
