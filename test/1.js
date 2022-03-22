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


console.log(/^<((?:[a-zA-Z_][\-.0-9_a-zA-Za-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]*:)?[a-zA-Z_][\-.0-9_a-zA-Za-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]*)/.exec("<compent id='app'></compent>"))
