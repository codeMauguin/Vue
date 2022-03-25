class VNode {
    #context = [];
    mainContext = undefined;
    key;

    constructor(tagName,
                attributes,
                props,
                children,
                key,
                type,
                context) {
        this.tagName = tagName;
        this.attributes = attributes;
        this.props = props;
        this.children = children;
        this.key = key;
        this.type = type;
        this.mainContext = context;
    }

    get context() {
        return this.#context;
    }

    set context(context) {
        this.#context.push(context)
    }
}


export function vNode(tagName,
                      attributes,
                      props,
                      children = [],
                      type,
                      context = undefined) {
    return new VNode(tagName,
                     attributes,
                     props,
                     children,
                     undefined,
                     type,
                     context);
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
