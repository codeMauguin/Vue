import {isNotObject, isObject} from "../util/index.js";

function ƒ(target, context) {
    return new Proxy(target, {
        set(target, key, value, receiver) {
            if (!/length/gi.test(String(key))) {
                if (target[key] === value) {
                    return true;
                } else {
                    const result = Reflect.set(target, key, value, receiver);
                    context.update();
                    return result;
                }
            } else {
                return Reflect.set(target, key, value, receiver);
            }
        },
    });
}

export default function createProxy(target, context) {
    if (isNotObject(target)) {
        console.warn(`${target} is not a Object!`);
        return undefined;
    }
    for (const key of Object.keys(target)) {
        if (isObject(target[key])) {
            target[key] = createProxy(target[key], context);
        }
    }
    return ƒ(target, context);
}
