import { loadNode, Node } from "./index.js";

/**
 *
 * @param {VNode}node
 */
export default function createElement(node) {
    if (node.hookNode && node.hookNode instanceof Node) {
        /**
         * 如果有子节点，加载，子节点排除为dom类型
         */
        loadNode(node.hookNode);
    }
    return document.createElement(node.tagName);
}
