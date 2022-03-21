function isNull(target) {
    return target === void 0 || target === null;
}

const isArray = Array.isArray;


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
