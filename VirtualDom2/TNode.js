import { Node } from "./index.js";
import { mustache as h } from "../Mustache/index.js";
import { isMustache } from "../util/index.js";

export default class TNode extends Node
{
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
    key;

    /**
     * @param {String} template
     */
    constructor ( template )
    {
        super();
        this.text = template;
        this.template = template;
        this.key = this.template.length << 5;
    }

    /**
     * @param {any} context
     */
    render ( context )
    {
        if ( isMustache( this.template ) )
            this.text = h( this.template, context );
    }

    /**
     *
     * @return {Text}
     */
    init ()
    {
        // @ts-ignore
        return this.elm = document.createTextNode( this.text );
    }

    clone ()
    {
        let clone = new TNode( this.template );
        clone.text = this.text;
        clone.static = this.static;
        return clone;
    }

    /**
     * @param {Node | import("./ENode.js").default} other
     */
    equal ( other )
    {
        //@ts-ignore
        return this.key === other.key && this.isInstance( other ) && this.text === other.text;
    }

}
