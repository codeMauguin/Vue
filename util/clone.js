import {clone as h, isArray, isNotObject, isNull} from "./index.js";
import {isFunction} from "./Type.js";

export default function (target) {
    if (isNull(target)) {
        console.warn("target is null");
    }
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
            Reflect.set(clone,
                        key,
                        h(
                            Reflect.get(target,
                                        key,
                                        target)
                        ),
                        clone);
        }

        return clone;
    }

}