import {error} from "../log";
import {mustaches} from '../Mustache';
import {Observer} from '../observer';
import {clone, isArray, isNotNull, isNotObject, isNull, isObject, isRef} from '../util';
import {_c_, _t_, _v_} from './';

const emptyDOM = document.createElement('div');

const forRegExp = /((?<head>\(.*\))|(?<header>^\w+))\s+(?<body>in|of)\s+(?<target>.*)/;
const aliasExp = /(?<=[(|,]).*?(?=[,|)])/gi;
const methodRegExp = /(?<name>^\w+)(?:\((?<args>([\w,]+))\)$)?/;

function cloneNode(node) {
    switch (node.type) {
        case "ELEMENT":
            return _v_(node.tagName,
                       {
                           props: clone(node?.props), attributes: clone(node?.attributes),
                       },
                       node.children.map(child => cloneNode(child)))
        case "TEXT-NODE":
            return _t_([node.value, node.static])
        case "COMMENT":
            return _c_(node.value)
    }
}

function defineShow(IF_KEY,
                    children,
                    context) {
    let res = undefined;
    for (let i = 0; i < IF_KEY.length; ++i) {
        const block = IF_KEY[i];
        let offset = 0, end = true;
        for (let index = 0; index < block.length - 1; ++index) {
            const element = block[index];
            const {content: {value, index: element_index}} = element;
            if (end && mustaches(value,
                                 context)) {
                end = false;
                res = children[element_index - offset]
            } else {
                //
                children.splice(element_index - offset++,
                                1);
            }
        }
        //Processing the last element: the main processing is else or else-if
        const element = block[block.length - 1];
        const {content: {value, index: element_index}} = element;
        if (element.key !== 3) {//not else end
            if (!mustaches(value,
                           context)) {//ELSE IF ALSO HAS NO MATCH
                children.splice(element_index - offset++,
                                1);
            } else {
                res = children[element_index - offset]
            }
        } else if (!end) {//Indicates that there is a successful match before
            children.splice(element_index - offset++,
                            1);
        } else {
            res = children[element_index - offset]
        }
    }
    return res;
}

/**
 * @param {string} header
 * @param {[]} match
 * @param {number} index
 * @param {any} value
 * @param key
 */
function build(header,
               match,
               index,
               value,
               key = undefined) {
    if (isNotNull(match)) {
        switch (match.length) {
            case 1:
                return {
                    [match[0]]: value
                }
            case 2:
                return {
                    [match[0]]: value, [match[1]]: key ?? index
                }
            case 3:
                return {
                    [match[0]]: value, [match[1]]: key, [match[2]]: index
                }
        }
    } else {
        return {
            [header]: value
        }
    }
}

function defineFor(temp,
                   dynamic,
                   context) {
    let regExpExecArray = forRegExp.exec(dynamic.value);
    if (isNull(regExpExecArray)) {
        error(`v-for template error:${dynamic.value}`);
        return [];
    }
    const header = regExpExecArray?.groups?.header;
    const head = regExpExecArray?.groups?.head;
    let match = head?.match(aliasExp);
    const target = mustaches(regExpExecArray.groups.target,
                             context);
    if (isNotObject(target)) {
        error(`for Object requires object or array type:${target}`)
        return [];
    }
    const result = [];
    if (isArray(target)) {
        for (let index = 0; index < target.length; ++index) {
            let _context = build(header,
                                 match,
                                 index,
                                 target[index]);
            let child = cloneNode(temp,
                                  context);
            compileAttributes(child,
                              [_context, ...context]);
            compileChild(child.children,
                         [_context, ...context]);
            result.push(child);
        }
    } else {
        const onKeys = Reflect.ownKeys(target);
        for (let i = 0; i < onKeys.length; i++) {
            const value = target[onKeys[i]];
            const _context = build(header,
                                   match,
                                   i,
                                   value,
                                   onKeys[i]);
            let child = cloneNode(temp,
                                  context);
            compileAttributes(child,
                              [_context, ...context]);
            compileChild(child.children,
                         [_context, ...context]);
            result.push(child);
        }
    }
    return result;
}


function generateClick(name,
                       args,
                       context) {
    const fn = mustaches(name,
                         context);
    args = args?.split?.(',');
    return () => {
        if (isNotNull(args)) {
            const _arguments = [];
            for (const arg of args) {
                if (arg === '') {
                    Array.prototype.push.apply(_arguments,
                                               [undefined]);
                } else {
                    Array.prototype.push.apply(_arguments,
                                               [mustaches(arg,
                                                          context)]);
                }
            }
            fn.apply(context[context.length - 1],
                     _arguments);
        } else {
            fn.call(context[context.length - 1]);
        }
    };
}

function compileAttributes(node,
                           context) {
    const {attributes, type} = node;
    if (!Object.is(type,
                   "ELEMENT")) return;
    node.hasCode = attributes.concat(...(node.props ?? []))
                             .reduce((a,
                                      b) => a + b[0],
                                     node.tagName);
    //check 第一个是否为ref
    if (attributes.length > 0) {
        for (let i = 0; i < attributes.length; ++i) {
            const [key, value, type] = attributes[i];
            if (type === 0) continue;
            switch (key) {
                case 'ref': {
                    attributes[i][1] = mustaches(value,
                                                 context,
                                                 false) ?? function (elm) {
                        context[context.length - 1].$emit([key, {key: value, elm}]);
                    };
                }
                    break;
                case "click": {
                    const {groups: {name, args}} = methodRegExp.exec(value);
                    attributes[i][1] = generateClick(name,
                                                     args,
                                                     context);
                    break;
                }
                case "key":
                    node.key = mustaches(value,
                                         context);
                    break;
                default:
                    attributes[i][1] = clone(mustaches(value,
                                                       context));

            }

        }
    }

}

function compileProps(props,
                      observer,
                      INDEX) {
    if (isNotNull(props)) {
        let dynamic = undefined;
        for (let index = 0; index < props.length; ++index) {
            const [key, value] = props[index];
            switch (key) {
                /**
                 * 处理if标签
                 */
                case "if":
                case "else-if":
                case `else`: {
                    observer.$emit(key,
                                   {index: INDEX, value});
                }
                    break;
                case "for":
                    dynamic = {index: INDEX, value};
                    break;
                default:
                    break;
            }
        }
        return dynamic;
    }
    return undefined;
}

/**
 *
 * @param {Array}children
 * @param {Array}context
 */
export function compileChild(children,
                             context) {
    const observer = new Observer();
    for (let index = 0; index < children.length; ++index) {
        const child = children[index];
        const {type} = child;
        if (type === "TEXT-NODE") {
            child.value = child.static ? decode(child.value) : mustaches(decode(child.value),
                                                                         context);
            child.hasCode = child.value;
        } else if (type === "COMMENT") {
            child.hasCode = child.value;
        } else {
            const {props} = child;
            if (props && props.length > 0) {
                child.dynamic = compileProps(props,
                                             observer,
                                             index);
                child.props = undefined;
            } else {
                compileAttributes(child,
                                  context);
                compileChild(child.children,
                             context);
            }
        }

    }
    const $if = observer.$on("IF_KEY");
    if (isNotNull($if)) {
        const $child = defineShow($if,
                                  children,
                                  context);

        if ($child) {
            compileAttributes($child,
                              context);
        }
    }
    for (let index = children.length - 1; index > -1; --index) {
        const element = children[index];
        if (!element.dynamic) continue;
        const child = defineFor(element,
                                element.dynamic,
                                context);
        children.splice(index,
                        1,
                        ...child);
    }
}

function decode(content) {
    if (/[&]/.test(content)) {
        emptyDOM.innerHTML = content;
        return emptyDOM.textContent;
    } else return content;

}

function toString(target) {
    return isObject(target) ? isRef(target) ? target.value : JSON.stringify(target) : target;
}
