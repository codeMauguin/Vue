import {isMustache} from "../util";
import {comment, TNode, VNode} from "./index.js";

export function _t_(text,isStatic=!isMustache(text)) {
    return TNode(text,
               isStatic  );
}

export function _v_(
    tagName,
    {props = undefined,attributes = undefined,dynamicProps =undefined} = {},
    children,
) {
    return VNode(tagName,
                 attributes,
                 props,
                 dynamicProps,
                 children);
}

export function _c_(data) {
    return comment(data);
}
