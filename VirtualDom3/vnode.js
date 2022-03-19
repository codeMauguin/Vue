export function VNode(tagName,
                      attributes,
                      props,
                      children = []) {
    return {
        __proto__: VNode.prototype, tagName, attributes, props, children, key: undefined, get type() {
            return "ELEMENT";
        },
        dynamic:undefined
    };
}

export function TNode(text,
                      isStatic) {
    return {
        __proto__: TNode.prototype, static: isStatic, value: text, get type() {
            return "TEXTNODE";
        },
    };
}

export function comment(data) {
    return {
        __proto__: comment.prototype, get type() {
            return "COMMENT";
        }, value: data,
    };
}
