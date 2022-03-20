import {clone as h, isArray, isNotObject} from "./index.js";
import {isFunction} from "./Type.js";

export default function (target,
                         exclude = "") {
    if (isNotObject(target) || isFunction(target)) {
        return target;
    }
    if (isArray(target)) {
        const clone = [];
        Array.from(target)
             .forEach(r => {
                 clone.push(h(r));
             });
        return clone;
    } else {
        const clone = Object.create({
                                        __proto__: target.__proto__
                                    });
        const keys = Reflect.ownKeys(target);
        for (const key of keys) {
            console.log(key)
            Reflect.set(clone,
                        key,
                        key === exclude ? Reflect.get(target,
                                                      key,
                                                      target) : h(
                            Reflect.get(target,
                                        key,
                                        target)
                        ),
                        clone);
        }

        return clone;
    }

}
