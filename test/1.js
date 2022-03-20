function isNull(target) {
    return target === void 0 || target === null;
}

const isArray = Array.isArray;

/**
 *
 * @param {Array} target
 * @param {Array} source
 * @param compare
 */
function updateArray(target,
                     source,
                     compare = (a,
                                b) => a === b) {
    if (!isArray(target) || !isArray(source)) {
        return null;
    }
    const add = [], del = [];
    let old_index = 0, new_index = 0;
    P: while (old_index < target.length && new_index < source.length) {
        if (target[old_index] === null) {
            old_index++;
            continue;
        }
        for (let i = old_index; i < target.length; ++i) {
            if (compare(target[i],
                        source[new_index])) {
                target[i] = null;
                old_index++;
                new_index++;
                continue P;
            }
        }
        add.push(source[new_index++]);
    }
    target.filter((e) => e !== null)
          .forEach((key) => del.push(key));
    if (new_index++ < source.length) {
        for (; new_index < source.length; ++new_index) {
            add.push(source[new_index]);
        }
    }
    return {del, add};
}

function updateObject(target,
                      source) {
    if (isNull(target) || isNull(source)) return;
    const update = [], del = [], add = [];
    const oldKeys = Reflect.ownKeys(target);
    const newKeys = Reflect.ownKeys(source);
    let oldKey_index = 0, newKey_index = 0, oldKey = oldKeys[oldKey_index],
        newKey = newKeys[newKey_index];
    P: while (oldKey_index < oldKeys.length && newKey_index < newKeys.length) {
        if (oldKey === null) {
            oldKey = oldKeys[++oldKey_index];
            continue;
        }
        for (let i = oldKey_index; i < oldKeys.length; ++i) {
            oldKey = oldKeys[i];
            if (oldKey === newKey) {
                if (target[oldKey] !== source[newKey]) {
                    update.push([newKey, source[newKey]]);
                }
                oldKeys[i] = null;
                newKey = newKeys[++newKey_index];
                continue P;
            }
        }
        console.log(newKey);
        add.push([newKey, source[newKey]]);
        newKey = newKeys[++newKey];
    }
    oldKeys
        .filter((e) => e !== null)
        .forEach((key) => {
            del.push(key);
        });
    if (newKey_index++ < newKeys.length) {
        for (; newKey_index < newKeys.length; ++newKey_index) {
            add.push([newKeys[newKey_index], source[newKeys[newKey_index]]]);
        }
    }
    return {del, add, update};
}

console.log(updateObject({
                             id: 1, name: "小红",
                         },
                         {
                             name: "小明", hobby: [],
                         },),);
console.log(updateArray([1, 2, 3],
                        [12, 12, 2, 4]));

function LoopUp(value) {
    if (this === undefined) return new LoopUp(value);
    this.value = value;
    const that = this;
    return {
        set(value) {
            that.value = value;
        }, get() {
            return that.value;
        }
    }
}


let loop = LoopUp(1);
const target = {};
Reflect.defineProperty(target,
                       "id",
                       loop)

console.log(target)
const regExp = /((?<key>\w+):(?<value>\w+);?)/g;
let style;
while ((style = regExp.exec("id:1; name:12")) !== null) {
    console.log(style)
    console.log("id:1;name:12".slice(regExp.lastIndex))
}
