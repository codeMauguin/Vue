import { Node } from "./index.js";
import { mustache } from "../Mustache/index.js";
export default class TNode extends Node {
    textContent;
    template;
    oldTemplate;
    constructor(text) {
        super();
        this.textContent = text;
        this.template = text;
    }

    updateData(context) {
        this.oldTemplate = this.textContent;
        const newText = mustache(this.template, context);
        this.textContent = newText;
    }

    update(context) {
        if (this.oldTemplate !== this.textContent) {
            this.elm.textContent = this.textContent;
        }
    }
    static of() {
        return new TNode();
    }

    toString() {
        return "TNode";
    }

    of() {
        return TNode.of();
    }
}
