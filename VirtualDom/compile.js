import { createElement, createText, h, VNode } from "./index.js";
import { isNotNull } from "../util/index.js";

/**
 * 编译子节点
 * @param{NodeListOf<ChildNode>} elements
 * @param collect
 * @return VNode|TNode
 */
function* compileChildren(elements, collect) {
    for (const element of elements)
        if (element instanceof Element) {
            const c = compile(element);
            if (c["props"].type) {
                collect.push({
                    prefix: c["props"].type.prefix
                        ? { node: c, template: c["props"].type.prefix }
                        : null,
                    suffix: isNotNull(c["props"].type.suffix)
                        ? { node: c }
                        : null,
                });
            }
            yield c;
        } else {
            yield h(null, null, element.textContent);
        }
}

const dynamic = /(:)|^([@*])/gi;

/**
 *
 * if 节点属性上为 prefix
 * else 节点属性为 suffix
 * @param {NamedNodeMap} attrs
 */
export function compileProps(attrs) {
    const props = Object.create({
        attrs: Object.create(null),
        dynamicAttrs: Object.create(null),
        type: null,
        dynamicEven: Object.create(null),
    });
    for (const [_, { name, value }] of Object.entries(attrs)) {
        let _name = name;
        switch (true) {
            case /@click|@value|v-model:/gi.test(name):
                {
                    Reflect.set(
                        props.dynamicEven,
                        name,
                        value,
                        props.dynamicEven,
                    );
                }
                break;
            case /v-bind:/gi.test(name):
                {
                    _name = name.replace(/v-bind:/, "");
                    Reflect.set(
                        props.dynamicAttrs,
                        _name,
                        value,
                        props.dynamicAttrs,
                    );
                }
                break;
            case /@id|@class/gi.test(name):
                {
                    _name = name.slice(1, name.length);
                    Reflect.set(
                        props.dynamicAttrs,
                        _name,
                        value,
                        props.dynamicAttrs,
                    );
                }
                break;
            case /v-if/gi.test(name):
                {
                    Reflect.set(props, "type", { prefix: value }, props);
                }
                break;
            case /v-else/gi.test(name):
                {
                    Reflect.set(props, "type", { suffix: value }, props);
                }
                break;
            default: {
                Reflect.set(props.attrs, name, value, props.attrs);
            }
        }
    }
    return props;
}

/**
 * 编译Element
 * @param {HTMLElement} element 元素
 *
 * @return VNode|TNode
 */
export default function compile(element) {
    const type = element.tagName;
    /**
     *
     * @type {Node[]}
     */
    const children = new Array(0);
    const collect = new Array(0);
    for (const child of compileChildren(element.childNodes, collect)) {
        children.push(child);
    }

    //TODO 解析类型
    function get() {
        return collect.shift();
    }

    function find() {
        const findIndex = collect.findIndex(c => isNotNull(c.suffix));
        if (findIndex > -1) {
            return collect.splice(findIndex, 1)[0];
        } else return -1;
    }
    do {
        const prefix = get();
        if (!prefix) {
            break;
        }
        let suffix = find();
        if (suffix === -1) {
            suffix = {
                suffix: {
                    node: document.createElement(prefix.prefix.node.tagName),
                },
            };
        } else {
            //将节点从子节点中移除
            console.log(suffix);
            const a=  children.splice(
              children.findIndex(child => child.equal(suffix.suffix.node)),
                1,
            );
            console.log(a);
        }
        prefix.prefix.node.hookNode = suffix.suffix.node;
        prefix.prefix.node.hookShow = prefix.prefix.template;
    } while (true);
    return h(type, compileProps(element.attributes), children);
}

/**
 *
 * @param {VNode|TNode}node
 */
export function loadNode(node) {
    node.elm = node instanceof VNode ? createElement(node) : createText(node);
    //初始化节点静态属性
    node.mountStaticProps();
    node.children.forEach(childNode => {
        node.elm.appendChild(loadNode(childNode));
    });
    return node.elm;
}
