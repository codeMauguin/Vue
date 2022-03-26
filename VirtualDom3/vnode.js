class VNode {
    key;
    dynamic;

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


export function vNode(tagName,
                      attributes,
                      props,
                      children = [],
                      type) {
    return new VNode(tagName,
                     attributes,
                     props,
                     children,
                     undefined,
                     type);
}

export function TNode(text,
                      isStatic) {
    const that = {context: []};
    return {
        static: isStatic, value: text, get type() {
            return "TEXT-NODE";
        }, get context() {
            return that.context;
        }, set context(context) {
            that.context.push(context);
        }
    };
}

export function comment(data) {
    return {
        get type() {
            return "COMMENT";
        }, value: data,
    };
}
