import {isMustache} from "../util/index.js";
import {comment, TNode, VNode} from "./index.js";

export function _t_(text,isStatic=!isMustache(text)) {
    return TNode(text,
               isStatic  );
}

export function _v_(
    tagName,
    {props: attributes = undefined, dynamic: props = undefined} = {},
    children,
) {
    return VNode(tagName,
                 attributes,
                 props,
                 children);
}

export function _c_(data) {
    return comment(data);
}
