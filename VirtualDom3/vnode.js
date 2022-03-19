class VNode {

    constructor(tagName,
                attributes,
                props,
                children,
                key,
                type) {
        this.tagName = tagName;
        this.attributes = attributes;
        this.props = props;
        this.children = children;
        this.key = key;
        this.type = type;
    }
}


export function Vnode(tagName,
                      attributes,
                      props,
                      children = []) {
    return new VNode(tagName,
                     attributes,
                     props,
                     children,
                     undefined,
                     "ELEMENT");
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
