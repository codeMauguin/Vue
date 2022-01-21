const forText = '(item,index) in array';
const forText2 = "item in array"
const exp = /(?<head>\(.*\)|\w+)\s+(?<body>in|of)\s+(?<end>.*)/
const a = exp.exec(forText);
console.log(a);
// @ts-ignore
console.log( /**@type{groups:RegExpExecArray}*/a?.groups["head"]);
const b = exp.exec(forText2);
console.log(b?.groups);
const aliasExp = /(.*?,|\))(\1*)/ig
// @ts-ignore
const head = aliasExp.exec(a?.groups["head"]);
console.log(head);

console.log("(item,name)".match(/(.*?[,|\)])/g));

Array.from([1, 2, 3]).forEach((c, index) => {
    console.log(c, index);
});
/**
 *if
 if
 else
 *
 *
 * c是if
 * [a,b,c,d,e]
 *
 */

const op = Object.create(null);
op.id = Object.create(null);
const clone = Object.assign(Object.create(null), op);
clone.id.name = "小红"
console.log(op, clone);
const isNull = (/** @type {any} */ target) =>
    target === undefined || target === null || target === (void 0);
const isNotNull = (/** @type {any} */ target) => !isNull(target);


class Options {
    /**
     * @type {null}
     */
    value;

    /**
     * @param {null} value
     */
    constructor(value) {
        this.value = value;
    }

    get() {
        return this.value;
    }

    /**
     * @param {any} defaultResult
     */
    orElse(defaultResult) {
        if (isNull(this.value)) {
            return defaultResult;
        }
        return this.value;
    }
}

class Stream {
    /**
     * @type {string | any[]}
     */
    object = [];

    /**
     * @type {FilterStream | this | MapStream}
     */
    next;
    parent;

    /**
     * @param {any[]} object
     */
    constructor(object) {
        this.object = object;
        this.parent = this;
    }

    /**
     * @param {(r: any) => any} action
     */
    map(action) {
        const res = new MapStream(action, this.parent);
        let that = this;
        while (isNotNull(that.next)) {
            // @ts-ignore
            that = that.next;
        }
        that.next = res;
        return res;
    }

    /**
     * @param {(r: any) => boolean} predicate
     */
    filter(predicate) {
        const res = new FilterStream(predicate, this.parent);
        let that = this;
        while (isNotNull(that.next)) {
            // @ts-ignore
            that = that.next;
        }
        that.next = res;
        return res;
    }

    findFirst() {
        let index = 0;
        P: while (index < this.object.length) {
            const obj = this.object[index];
            let that = this.parent.next;
            let res = obj;
            while (isNotNull(that)) {
                if (that instanceof FilterStream) {
                    if (that.predicate(res) === false) {
                        index++;
                        continue P;
                    }
                } else {
                    // @ts-ignore
                    res = that.action(res);
                }
                that = that.next;
            }

            return new Options(res);
        }
        return new Options(null);
    }
}


class FilterStream
    extends Stream {
    predicate;
    parent;
    /**
     * @type {FilterStream | this | MapStream}
     */
    next;

    /**
     * @param {any} predicate
     * @param {Stream} parent
     */
    constructor(predicate, parent) {
        // @ts-ignore
        super();
        this.predicate = predicate;
        this.parent = parent;
    }

    /**
     * @param {(r: any) => any} action
     */
    map(action) {
        return this.parent.map(action);
    }

    /**
     * @param {(r: any) => boolean} predicate
     */
    filter(predicate) {
        return this.parent.filter(predicate);
    }

    /**
     * @param {any} obj
     */
    executor(obj) {
        return this.predicate(obj);
    }

    findFirst() {
        return this.parent.findFirst();
    }
}

class MapStream
    extends Stream {
    action;
    parent;
    /**
     * @type {FilterStream | this | MapStream}
     */
    next;

    /**
     * @param {any} action
     * @param {Stream} parent
     */
    constructor(action, parent) {
        // @ts-ignore
        super();
        this.action = action;
        this.parent = parent;
    }

    /**
     * @param {any} obj
     */
    executor(obj) {
        return this.action(obj);
    }

    /**
     * @param {(r: any) => any} action
     */
    map(action) {
        return this.parent.map(action);
    }

    /**
     * @param {(r: any) => boolean} predicate
     */
    filter(predicate) {
        return this.parent.filter(predicate);
    }

    findFirst() {
        return this.parent.findFirst();
    }
}

const arr = [1, 2, 3];
const stream = new Stream(arr);
const res = stream.map((/** @type {number} */ r) => {
    return r + 1;
}).filter((/** @type {number} */ r) => r === 4).findFirst().orElse("str is come from there")
console.log(res);

const Task = (then) => ({
    then,
    map: (action) =>
        Task((resolve) =>
            then(
                (success) => resolve(success === false ? false : action(success))
            ),
        ),
    filter: (predicate) => Task((res) => then((suc) => res(predicate(suc) === true ? suc : false))),
});
console.log(Task((/** @type {(arg0: number) => void} */ r) => {
    r(90)
}).map((/** @type {any} */ r) => 900).then((/** @type {any} */ r) => {
    console.log("task:->", r);
}));

let array = [1, 2, 3, 4];
Task((/** @type {(arg0: number | undefined) => void} */ res) => {
    res(array.pop())
})

class condition {
    #array = [];
    /**
     * @type {any[]}
     */
    taskArray = [];
    task = Task(
        (        /** @type {(arg0: any) => any} */ resolve) => resolve(this.taskArray.pop())
    );

    /**
     * @param {any} array
     */
    constructor(array) {
        this.#array.push(...array)
    }

    /**
     * @param {number[]} array
     */
    static stream(array) {
        return new condition(array);
    }

    /**
     * @param {(r: any) => any} action
     */
    map(action) {
        this.task = this.task.map(action);
        return this;
    }

    /**
     * @param {(r: any) => boolean} predicate
     */
    filter(predicate) {
        this.task = this.task.filter(predicate);
        return this;
    }

    /**
     * @param {(value: any, index: number, array: any[]) => void} callbackfn
     */
    forEach(callbackfn) {
        this.#array.forEach(callbackfn);
    }

    collect() {
        const result = [];
        while (this.#array.length > 0) {
            this.taskArray.push(this.#array.shift());
            this.task.then((/** @type {boolean} */ res) => {
                if (isNotNull(res) && res !== false) {
                    result.push(res);
                }
            })
        }
        return result;
    }

    findFirst() {
        let result = undefined;
        while (this.#array.length > 0) {
            this.taskArray.push(this.#array.shift());
            this.task.then((/** @type {any} */ r) => {
                result = r;
            });
            if (isNotNull(result) && result !== false) {
                break;
            }
            result = undefined;
        }
        return ({
            get() {
                return result
            }, /**
             * @param {any} other
             */
            orElse(other) {
                return isNotNull(result) ? result : other
            }
        })
    }
}

const ee = condition.stream([1, 2, 3, 4, 4]).map((/** @type {number} */ r) => {
    return r + 1;
}).filter((/** @type {number} */ r) => r > 3).collect();
console.log(ee);

const defaults = {
    set baseURL(value) {
        let v = {
            name: "default",
            url: value
        }
        // @ts-ignore
        this._baseURL.push(v);
    },
    _baseURL: [],
}
defaults.baseURL = "io";
console.log(defaults._baseURL);
//[1,2,3,4,5,6]
let ch = [1, 2, 3, {id: 1}, 5, 6]
const algorithm = /(?<arg>(?<=[(|,])).*?(?=[,|)])/gi;


console.log("(item,index)".match(algorithm).groups)

const region = /(?<name>\b\w+(?=\())(?<arg>.*\)$)/;
let regExpExecArray = region.exec("add()");
console.log(regExpExecArray);
console.log(/{{(.+?)}}|\${(.+?)}/gi.exec("{{id:1}}{{name:s}}"))
