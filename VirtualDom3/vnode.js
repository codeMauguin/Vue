const isTagName = /html|body|base|head|link|meta|style|title|address|article|aside|footer|header|h1|h2|h3|h4|h5|h6|nav|section|div|dd|dl|dt|figcaption|figure|picture|hr|img|li|main|ol|p|pre|ul|a|b|abbr|bdi|bdo|br|cite|code|data|dfn|em|i|kbd|mark|q|rp|rt|ruby|s|samp|small|span|strong|sub|sup|time|u|var|wbr|area|audio|map|track|video|embed|object|param|source|canvas|script|noscript|del|ins|caption|col|colgroup|table|thead|tbody|td|th|tr|button|datalist|fieldset|form|input|label|legend|meter|optgroup|option|output|progress|select|textarea|details|dialog|menu|summary|template|blockquote|iframe|tfoot/i


class VNode {
    key;
    dynamic;

    constructor(tagName,
                attributes,
                props,
                children,
                key) {
        this.type = isTagName.test(tagName) ? "ELEMENT" : "COMPONENT";
        this.tagName = tagName;
        this.attributes = attributes;
        this.props = props;
        this.children = children;
        this.key = key;
    }

}


export function vNode(tagName,
                      attributes,
                      props,
                      children = []) {
    return new VNode(tagName,
                     attributes,
                     props,
                     children,
                     undefined);
}

export function TNode(text,
                      isStatic) {
    return {
        static: isStatic, value: text, get type() {
            return "TEXT-NODE";
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
