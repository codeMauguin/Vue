import {propsMustache} from "../Mustache/index.js";
import {isArray, isMustache, isNotNull, isNull, isObject} from "../util/index.js";
import {ENode} from "./index.js";
import Vue from "../Vue/Vue.js";

const forRegExp = /(?<head>\(.*\)|\w+)\s+(?<body>in|of)\s+(?<target>.*)/;
const aliasExp = /(?<=[(|,]).*?(?=[,|)])/gi;

/**
 * @param {any} context
 * @param {ENode} node
 * @param {string} attrElement
 * @param {string} attrElement2
 */
const forProcessor = ({context, node, attrElement, attrElement2}) => {
    const forModel = {};
    const foredeck = forRegExp.exec(attrElement);
    // @ts-ignore
    const head = foredeck.groups["head"];
    // @ts-ignore
    const body = foredeck.groups["body"];
    let global, view;
    if (context instanceof Vue) {
        global = context;
        view = context._data;
    } else {
        global = context.global;
        view = context;
    }
    // @ts-ignore
    const target = propsMustache(foredeck.groups["target"], view);
    if (isNull(head) || isNull(body) || isNull(target)) {
        new Error("v -for template is error");
    }
    forModel["target"] = target;
    const headers = head.match(aliasExp);
    if (isNull(headers)) {
        forModel["itemKey"] = head;
    } else {
        // @ts-ignore
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
                let clone = child.clone();
                const _context = {
                    [forModel["itemKey"]]: convex, [forModel["indexKey"]]: index, ["global"]: global
                };
                clone.key = propsMustache(attrElement2, _context);
                compile(clone, _context, index);
                newChildren.push(clone);
            }
            index++;
        }
    } else if (isObject(target)) {
        for (const ownKey of Reflect.ownKeys(target)) {
            const value = Reflect.get(target, ownKey, target);
            for (const child of templateChildren) {
                let clone = child.clone();
                clone.key = value[attrElement2];
                compile(clone, {
                    [forModel["itemKey"]]: value,
                    [forModel["nameKey"]]: ownKey,
                    [forModel["indexKey"]]: index,
                    ["global"]: global
                }, index);
                newChildren.push(clone);
            }
            index++;
        }
    }
    return newChildren;
};


/**
 * @param {ENode|TNode} node
 * @param context
 * @param index
 */
export function compile(node, context, index = 1) {
    if (node instanceof ENode) {
        // @ts-ignore
        node.static = !(Reflect.hasOwnProperty(node.prop.attributes) || Reflect.hasOwnProperty(node.prop.method));
        //通过节点属性生成key +index
        //设置flag 当是for 信息时，子节点不需要递归编译
        let flag = true;
        if (isNotNull(node.dynamicTemplate)) {
            // @ts-ignore
            node.children = forProcessor({
                context: context,
                node: node,
                attrElement: node.dynamicTemplate,
                attrElement2: node.prop.attributes["key"]
            });
            flag = false;
        }
        if (node.key === undefined) node.key = (index << 5) + ((Object.keys(node?.attributes ?? {}).length + 9) << 2) + ((Object.keys(node.prop.attributes).length + 8) << 3) + ((Object.keys(node.prop.method).length + 9) << 4);
        node.render(context);
        //处理子节点的if-else-if -else
        const watcher = ifProcessor(node.children);
        /**
         * 取出消息
         */
        if (!watcher.$empty()) {
            watcher.$on(node, context._data);
        }
        if (flag) {
            // @ts-ignore
            node.children.forEach((child, index) => compile(child, context, index));
        }
    } else {
        //@ts-ignore
        const tem = node.text;
        node["static"] = !isMustache(tem);
        if (!(node["static"] = !isMustache(tem))) node.render(context);
    }
}

class Observer {
    /**
     *@type{Array<{index:number,attr:{}}>}
     */
    message = [];

    /**
     * @param {ENode} node
     * @param {any} context
     */
    $on(node, context) {
        const msg = this.message.shift();
        let index = 0;
        if (isNull(msg?.attr["if"])) {
            console.warn(`The if node should be defined first`);
            // @ts-ignore
            this.message.unshift(msg);
        } else {
            const res = propsMustache(msg?.attr["if"], context);
            console.log(context)
            if (res) {
                this.$destroy(node, 0);
                return;
            } else {
                // @ts-ignore
                node.children.splice(msg?.index + index--, 1);
            }
        }
        while (this.message.length > 0) {
            const res = this.message.shift() ?? {
                attr: "", index: -1
            };
            if (isNotNull(res?.attr["else-if"])) {
                if (propsMustache(res?.attr["else-if"], context)) {
                    break;
                } else {
                    node.children.splice(res.index + index--, 1);
                }
            } else if (isNotNull(res?.attr["else"])) {
                if (this.message.length !== 0) {
                    console.warn("Else tag is not last or multiple");
                    // Wipe the user's ass
                    node.children.splice(res.index + index--, 1);
                }
            } else {
                console.warn(`The label ${JSON.stringify(res?.attr)} should not appear here`);
                // Wipe the user's ass
                node.children.splice(res.index + index--, 1);
            }
        }
        this.$destroy(node, index);
    }

    /**
     * @param {ENode} node
     * @param {number} index
     */
    $destroy(node, index) {
        while (this.message.length > 0) {
            const res = this.message.shift();
            // @ts-ignore
            node.children.splice(res?.index + index--, 1);
        }
    }

    /**
     * @param {{ index: number;  attr: any; }} message
     */
    $emit(message) {
        this.message.push(message);
    }

    $empty() {
        return this.message.length === 0;
    }

}

const watcher = new Observer();

function ifProcessor(children) {
    for (let index = 0; index < children.length; index++) {
        const child = children[index];
        if (isNotNull(child.prop?.attributes["if"])) {
            watcher.$emit({
                index, attr: {
                    "if": child.prop.attributes["if"]
                }
            });
        } else if (isNotNull(child.prop?.attributes["else-if"])) {
            watcher.$emit({
                index, attr: {
                    "else-if": child.prop.attributes["else-if"]
                }
            });
        } else if (isNotNull(child.prop?.attributes["else"])) {
            watcher.$emit({
                index, attr: {
                    "else": child.prop.attributes["else"]
                }
            });
        }
    }
    return watcher;
}
