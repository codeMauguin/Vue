import { isNull, isObject } from "../util/index.js";
import { createProxy as reactive } from "./index.js";
export class ref {
  value;
  constructor(value) {
    this.value = value;
  }
}
export default function (value) {
  if (isNull(value)) {
    value = 0;
  } else if (isObject(value)) {
    console.warn("value is a object!");
    return reactive(value);
  }
  return new reactive(new ref(value));
}
