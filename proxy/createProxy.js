import { isNotObject, isObject } from "../util/index.js";
import Vue from "../Vue/Vue.js";
import { ref } from "./index.js";

/**
 * @param {any} target
 */
function ƒ(target) {
  return new Proxy(target, {
    set(target, key, value, receiver) {
      if (target[key] === value) {
        return true;
      } else {
        if (!(target instanceof ref)) {
          target["__ob__"]?.(target, value, () =>
            Reflect.deleteProperty(target, "__ob__"),
          ); //执行观察 this
        }
        if (!Reflect.has(target, key) && isObject(value)) {
          value = createProxy(value);
        }
        const result = Reflect.set(target, key, value, receiver);
        Vue.dept.notifyAll();
        return result;
      }
    },
  });
}

export default function createProxy(target) {
  if (isNotObject(target)) {
    console.warn(`${target} is not a Object!`);
    return undefined;
  }
  for (const key of Object.keys(target)) {
    if (isObject(target[key])) {
      target[key] = createProxy(target[key]);
    }
  }
  return ƒ(target);
}
