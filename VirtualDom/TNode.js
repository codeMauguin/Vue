import {Node} from "./index.js";
import {mustache} from "../Mustache/index.js";

export default class TNode extends Node {
    textContent;
    template;
    oldTemplate;

    constructor(text) {
        super();
        this.textContent = text;
        this.template = text;
    }

    static of() {
        return new TNode();
    }

    loadStatic() {
        this.isStatic = !(/{{(.+?)}}/ig.test(this.template));
    }

    updateData(context) {
        if (this.isStatic) return;
        this.oldTemplate = this.textContent;
        this.textContent = mustache(this.template, context);
    }

    update(context) {
        if (this.isStatic) return;
        if (this.oldTemplate !== this.textContent) {
            this.elm.textContent = this.textContent;
        }
    }

    toString() {
        return "TNode";
    }

    of() {
        return TNode.of();
    }
}
