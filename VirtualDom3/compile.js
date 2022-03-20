import {_c_, _t_, _v_, comment, TNode} from './';
import {isArray, isNotNull, isNotObject, isNull} from '../util';
import {Observer} from '../observer';
import {packageValue, propsMustache as h} from '../Mustache';
import {error} from "../log";

const forRegExp = /((?<head>\(.*\))|(?<header>\w+))\s+(?<body>in|of)\s+(?<target>.*)/;
const aliasExp = /(?<=[(|,]).*?(?=[,|)])/gi;

function cloneNode(node) {
    switch (node.type) {
        case "ELEMENT":
            return _v_(node.tagName,
                       {props: node?.props, attributes: node?.attributes},
                       node.children.map(cloneNode))
        case "TEXTNODE":
            return _t_(node.value,
                       node.static)
        case "COMMENT":
            return _c_(node.value)
    }
}

function defineShow(IF_KEY,
                    node,
                    context) {
    for (let i = 0; i < IF_KEY.length; ++i) {
        const block = IF_KEY[i];
        let offset = 0, end = true;
        for (let index = 0; index < block.length - 1; ++index) {
            const element = block[index];
            const {content: {value, index: element_index}} = element;
            if (end && h(value,
                         context)) {
                end = false;
            } else {
                node.children.splice(element_index - offset++,
                                     1);
            }
        }
        //Processing the last element: the main processing is else or else-if
        const element = block[block.length - 1];
        const {content: {value, index: element_index}} = element;
        if (element.key !== 3) {//not else end
            if (!h(value,
                   context)) {//ELSE IF ALSO HAS NO MATCH
                node.children.splice(element_index - offset++,
                                     1);
            }
        } else if (!end) {//Indicates that there is a successful match before
            node.children.splice(element_index - offset++,
                                 1);
        }
    }
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
    const header = regExpExecArray?.groups?.header;
    const head = regExpExecArray?.groups?.head;
    let match = head?.match(aliasExp);

    const target = h(regExpExecArray.groups.target,
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
            let child = cloneNode(temp);
            initContext(child,
                        _context, ...temp.context)
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
            let child = cloneNode(temp);
            initContext(child,
                        _context, context)
            result.push(child);
        }
    }
    return result;
}

function initContext(node,
                     ...context) {
    for (let contextElement of context) {
        node.context = contextElement
    }
    if (node.type === "ELEMENT") {
        for (let child of node.children) {
            initContext(child,
                ...context);
        }
    }
}


/**
 *
 * @param {VNode} node
 * @param {Observer}observer
 * @param {Object}context
 * @param {number}INDEX at the subscript position of the parent node
 */
function compileElement(node,
                        observer,
                        context,
                        INDEX) {
    if (isNotNull(node.props)) {
        for (let index = 0; index < node.props.length; ++index) {
            const [key, value] = node.props[index];
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
                    observer.$emit(key);
                    node.dynamic = {index: INDEX, value};
                    break;
                case "style":
                case "class": {
                    if (isNotNull(node['attributes'])) {
                        node['attributes']["push"]([key, node.props[index][1], 1]);
                    } else {
                        node['attributes'] = [[key, node.props[index][1], 1]];
                    }
                }
                    break;
                case "key":
                    node['key'] = value;
                    break;
                default:
                    break;
            }
        }
    }
    if (node.children.length > 0) {
        const observer = new Observer();
        node.children.forEach((child,
                               index) => {
            compile(child,
                    context,
                    observer,
                    index);
        });
        const IF_KEY = observer.$on("IF_KEY");
        if (isNotNull(IF_KEY)) {
            //TODO context 自底向上编译 在for 中嵌套IF 的上下文需要处理
            defineShow(IF_KEY,
                       node,
                       context);
        }
        //for 4
        let for_time = observer.$on("for");
        if (isNotNull(for_time)) {
            //TODO context 自底向上编译 在for中嵌套 的上下文需要处理，initContext是递归的取更新Context，上层的Context会覆盖下层的Context
            for (let index = node.children.length - 1; index > -1; --index) {
                if (for_time === 0) break;
                const element = node.children[index];
                if (element.type !== "ELEMENT" || isNull(element.dynamic)) continue;
                for_time--;
                //已经匹配到
                const [temp] = node.children.splice(index,
                                                    1);//先删除这个节点
                const children = defineFor(temp,
                                           element.dynamic,
                                           context);
                node.children.splice(index,
                                     index,
                                     ...children)
            }
        }

    }
}

/**
 *
 * @param {VNode|TNode|comment} node node information
 * @param {Object} context context
 * @param observer observer
 * @param index The subscript position of the node in the parent node
 */
export function compile(node,
                        context,
                        observer = new Observer,
                        index = -1) {
    node.context = context;
    switch (node["type"]) {
        case "ELEMENT": {
            compileElement(node,
                           observer,
                           context,
                           index);
        }
            break;
        case "TEXTNODE": {
            node.value = packageValue(node.value);
        }
            break;
        case "COMMENT": {

        }
            break;
        default:
            throw new SyntaxError(`type not supported`);

    }
}
