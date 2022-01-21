import {htmlReader as parserHTML} from "../htmlParse/index.js";
import {mustache} from "../Mustache/index.js";
import {clone as deepClone, isArray, isNull, isObject} from "../util/index.js";

/**
 * @param {object} context 上下文
 * @param {string} value
 */
function methodFilter(context, value) {
    const methodRegExp =
        /(?<name>\w+)?([(,])(?<arg>.*?)(?=[,)])/g;
    let result = methodRegExp.exec(value);
    let name, args = [];
    do {
        // @ts-ignore
        const {groups: {name: N, arg} = {name: undefined}} = result;
        if (N) {
            name = N;
        }
        if (arg && arg !== '') {
            args.push(arg);
        }
    } while ((result = methodRegExp.exec(value)) !== null);
    console.log(name, context);
    const fn = mustache(
        name, context
    );
    return () => {
        const _args = [];
        Array.from(args).forEach((arg) => {
            _args.push(
                mustache(
                    arg, context
                ),
            );
        });
        return fn.apply(context, _args);
    }
}

function propsFilter(node, context, name, value) {
    if (name === "click") {
        Reflect.set(node.props.methods, name, methodFilter(context, value))
    } else {
        if (name === "for")
            node.props.attr[name] = value;
        else
            node.props.attr[name] = mustache(value, context);
    }
}

const forRegExp = /(?<head>\(.*\)|\w+)\s+(?<body>in|of)\s+(?<target>.*)/;
const aliasExp = /(?<=[(|,]).*?(?=[,|)])/gi;

function cloneNode(node) {
    let clone;
    if (node instanceof v) {
        const cloneChild = [];
        node.children.forEach(c => cloneChild.push(cloneNode(c)));
        clone = new v(node.tagName, deepClone(node.attr), cloneChild);
    } else {
        clone = new t(node.text);
    }
    return clone;
}

function forProcessor(context, node, attrElement, attrElement2) {
    const forModel = {};
    const foredeck = forRegExp.exec(attrElement);
    // @ts-ignore
    const head = foredeck.groups["head"];
    // @ts-ignore
    const body = foredeck.groups["body"];
    // @ts-ignore
    const target = mustache(foredeck.groups["target"], context);
    if (isNull(head) || isNull(body) || isNull(target)) {
        new Error("v -for template is error");
    }
    forModel["target"] = target;
    const headers = head.match(aliasExp);
    if (isNull(headers)) {
        forModel["itemKey"] = head;
    } else {
        forModel["itemKey"] = headers[0];
        // @ts-ignore
        if (headers.length === 2) {
            // @ts-ignore
            forModel["indexKey"] = headers[1];
        } else {
            // @ts-ignore
            forModel["nameKey"] = headers[1];
            // @ts-ignore
            forModel["indexKey"] = headers[2];
        }
    }
    const templateChildren = node.children;
    const newChildren = [];
    let index = 0;
    if (isArray(target)) {
        for (const convex of target) {
            for (const child of templateChildren) {
                let clone = cloneNode(child);
                clone.key = convex[attrElement2];
                clone.initProps({
                    [forModel["itemKey"]]: convex, [forModel["indexKey"]]: index, ["global"]: context
                })
                newChildren.push(clone);
            }
            index++;
        }
    } else if (isObject(target)) {
        for (const ownKey of Reflect.ownKeys(target)) {
            const value = Reflect.get(target, ownKey, target);
            for (const child of templateChildren) {
                let clone = cloneNode(child);
                clone.initProps({
                    [forModel["itemKey"]]: value,
                    [forModel["nameKey"]]: ownKey,
                    [forModel["indexKey"]]: index,
                    ["global"]: context
                })
                clone.key = value[attrElement2];
                newChildren.push(clone);
            }
            index++;
        }
    }
    node.children = newChildren;
}

export class v {
    tagName;
    props = {attr: {}, methods: {}};
    children;
    key;

    constructor(tagName, props, children) {
        this.tagName = tagName;
        this.attr = props;
        this.children = children;
    }

    initProps(context) {
        let pros = this.attr;
        this.attr = pros.attr;
        for (let [key, value] of Object.entries(pros.props)) {
            propsFilter(this, context, key, value);
        }
        let flag = isNull(this.props.attr["for"]);
        if (!flag) {
            forProcessor(context, this, this.props.attr["for"], this.props.attr["key"]);
            return;
        }
        //TODO先不处理@if
        if (flag)
            for (const child of this.children) {
                child.initProps(context);
            }
    }

    hasCode() {
        return this.key;
    }
}

export class t {
    text;

    constructor(text) {
        this.text = text;
    }

    initProps(context) {
        this.text = mustache(this.text, context);
    }
}

/**
 * @param {string} html
 */
export function init(html) {
    const AST = parserHTML(html);
    const context = {
        _c(tagName, props, children) {
            return new v(tagName, props, children);
        }, _t(text) {
            return new t(text);
        },
    }
    return new Function(`with(this){return ${ProcessingAST(AST)}}`).apply(context);
}


function ProcessingAST(ast) {
    if (ast instanceof Object) {
        const children = [];
        for (let c of ast.children) {
            children.push(ProcessingAST(c));
        }
        return `_c(${JSON.stringify(ast.tagName)},
        ${JSON.stringify({attr: ast.attr, props: ast.props})},
        [${children}])`;
    }
    return `_t(${JSON.stringify(ast)})`
}
