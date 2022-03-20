import {warn} from '../log';

function Observer() {
    if (this === undefined) return new Observer();
    /**
     *
     * @type {WeakMap<object, any[][]>}
     */
    this.message = new Map();
}

const keys = {
    IF: 1, ELSE_IF: 2, ELSE: 3
};
let IF_KEY = "IF_KEY";


Observer.prototype.$on = function (message) {
    return this.message.get(message);
};
/**
 * 提交信息
 * @param message
 * @param content
 */
Observer.prototype.$emit = function (message,
                                     content) {
    if (message === "if") {
        if (this.message.get(IF_KEY) === undefined) {
            this.message.set(IF_KEY,
                             [[{key: keys.IF, content}]]);
        } else {
            const value = this.message.get(message);
            value.push([{key: keys.IF, content}]);
        }
        return;
    }
    if (message === "else-if") {
        if (this.message.get(IF_KEY) === undefined) {
            warn(`no if header`);
            this.message.set(IF_KEY,
                             [[{key: keys.IF, content}]]);
            return;
        } else {
            let value = this.message.get(IF_KEY);
            let keyElement = value[value.length - 1];//最后一个 if[]判断是否闭合没有闭合报错
            let key = keyElement[keyElement.length - 1].key;
            if (key === keys.ELSE) {
                warn(`no if header`);
                value.push([{key: keys.IF, content}]);
                return;
            }
            keyElement.push({key: keys.ELSE_IF, content});
            this.message.set(IF_KEY,
                             value);
            return;
        }
    }
    if (message === "else") {
        let value = this.message.get(IF_KEY);
        if (value === undefined) throw new SyntaxError(`else without if tag`);
        let keyElement = value[value.length - 1];
        keyElement.push({key: keys.ELSE, content});

    }
};
export {
    Observer
};
