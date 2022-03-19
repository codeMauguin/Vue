import {comment, TNode, VNode} from './';
import {clone, isArray, isNotNull, isNull} from '../util';
import {Observer} from '../observer';
import {mustache as h} from '../Mustache';

const forRegExp = /((?<head>\(.*\))|(?<header>\w+))\s+(?<body>in|of)\s+(?<target>.*)/;
const aliasExp = /(?<=[(|,]).*?(?=[,|)])/gi;

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
        //处理最后一个元素:主要预防是else
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

function defineFor(temp,
                   dynamic,
                   context) {
    let regExpExecArray = forRegExp.exec(dynamic);
    const header = regExpExecArray.groups.header;
    const head = regExpExecArray.groups.head;
    const target = h(regExpExecArray.groups.target,
                     context);
    const result = [];
    if (isArray(target)) {
        for (let index = 0; index < target.length; ++index) {
            let _context = {};
            //构建上下文
            if (isNotNull(head)) {
                let match = head.match(aliasExp);
                Reflect.set(_context,
                            match[0],
                            target[index],
                            _context);
                if (isNotNull(match[1])) {
                    Reflect.set(_context,
                                match[1],
                                index);
                }
            } else {
                Reflect.set(_context,
                            header,
                            target[index],
                            _context);
            }
            let child = clone(temp);
            

        }


    }

    return undefined;
}

/**
 *
 * @param {VNode} node
 * @param observer
 * @param context
 * @param index
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
                    node.props[index][1] = h(value,
                                             context);
                    if (isNotNull(node['attributes'])) {
                        node['attributes']["push"]([key, node.props[index][1]]);
                    } else {
                        node['attributes'] = [[key, node.props[index][1]]];
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
            defineShow(IF_KEY,
                       node,
                       context);
        }
        //for 4
        let for_time = observer.$on("for");
        if (isNotNull(for_time)) {
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
    switch (node["type"]) {
        case "ELEMENT": {
            compileElement(node,
                           observer,
                           context,
                           index);
        }
            break;
        case "TEXTNODE": {

        }
            break;
        case "COMMENT": {

        }
            break;
        default:
            throw new SyntaxError(`type not supported`);

    }
}