import {Node} from "./index.js";
import {mustache as h} from "../Mustache/index.js";
import {isMustache, isNotNull} from "../util/index.js";

export default class TNode extends Node {
    text;
    template;
    isStatic = true;
    /**
     @type{Text}
     */
        // @ts-ignore
    elm;

    /**
     * 仅仅做没有else 的处理 if
     */
    nextHook;
    key;

    /**
     * @param {String} template
     */
    constructor(template) {
        super();
        this.text = template;
        this.template = template;
        this.key = this.template.length << 5;
    }

    /**
     * @param {any} context
     */
    render(context) {
        if (isNotNull(this.nextHook)) {
            let {hookNode, template, index} = this.nextHook;
            const isIF = h(template, {...context, ...context._data});
            if (isIF === true || isIF === "true" || isIF === "1") {
                hookNode.render(context);
                // @ts-ignore
                this.parent.children.splice(index, 1, hookNode);
            }

        } else if (isMustache(this.template))
            this.text = h(this.template, context);
    }

    /**
     *
     * @return {Text}
     */
    init() {
        // @ts-ignore
        return this.elm = document.createTextNode(this.text);
    }

    clone() {
        let clone = new TNode(this.template);
        clone.text = this.text;
        clone.static = this.static;
        clone.nextHook = this.nextHook;
        return clone;
    }

    /**
     * @param {Node | import("./ENode.js").default} other
     */
    equal(other) {
        //@ts-ignore
        return this.key === other.key && this.isInstance(other) && this.text === other.text;
    }

}
