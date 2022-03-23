class VNode {
    #context = [];
    mainContext = undefined;

    constructor(tagName,
                attributes,
                props,
                dynamicProps = [],
                children,
                key,
                type,
                context) {
        this.tagName = tagName;
        this.attributes = attributes;
        this.dynamicProps = dynamicProps;
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


export function Vnode(tagName,
                      attributes,
                      props,
                      dynamicProps,
                      children = [],
                      type,
                      context = undefined) {
    return new VNode(tagName,
                     attributes,
                     props,
                     dynamicProps,
                     children,
                     undefined,
                     type,
                     context);
}

export function TNode(text,
                      isStatic) {
    const that = {context: []};
    return {
        __proto__: TNode.prototype, static: isStatic, value: text, get type() {
            return "TEXTNODE";
        }, get context() {
            return that.context;
        }, set context(context) {
            that.context.push(context);
        }
    };
}

export function comment(data) {
    return {
        __proto__: comment.prototype, get type() {
            return "COMMENT";
        }, value : data,
    };
}
