import {isNull, isObject} from "../util";
import Vue from "../Vue/Vue.js";
import {reactive} from "./index.js";


class ref {
    constructor(val) {
        this._value = val;
    }

    _value;

    get value() {
        return this._value;
    }

    set value(val) {
        if (this._value === val) return;
        this["__ob__"]?.(val,
                         val,
                         () => Reflect.deleteProperty(this,
                                                      "__ob__"));
        this._value = val;
        Vue.dept.notifyAll();
    }
}

Reflect.defineProperty(ref,
                       "prototype",
                       {
                           configurable: false, writable: false, enumerable: false
                       });
export default function (value) {
    if (isNull(value)) {
        value = 0;
    } else if (isObject(value)) {
        console.warn("value is a object!");
        return reactive(value);
    }
    return new ref(value);
}
export {ref};
