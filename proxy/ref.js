import { isNull, isObject } from "../util/index.js";
import { createProxy as reactive } from "./index.js";
import Vue from "../Vue/Vue.js";
const value = Symbol("value");
export class ref {
  get value() {
    return this[value];
  }
  set value(val) {
    if (this[value] === val) return;
    this["__ob__"]?.(val, val, () => Reflect.deleteProperty(target, "__ob__"));
    this[value] = val;
    Vue.dept.notifyAll();
  }
  [value];
  constructor(val) {
    this[value] = val;
  }
  toString() {
    return this[value];
  }
}
export default function (value) {
  if (isNull(value)) {
    value = 0;
  } else if (isObject(value)) {
    console.warn("value is a object!");
    return reactive(value);
  }
  return new ref(value);
}