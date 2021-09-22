import {TNode, VNode} from "./index.js";

export default function h(type, props, children) {
    if (type) {
        return new VNode(type,props,children);
    } else {
        return new TNode(children);
    }
}