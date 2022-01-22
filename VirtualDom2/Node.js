// @ts-nocheck
import { ENode, TNode } from "./index.js";

export default class Node
{
    /**
     * @type {boolean}
     */
    isStatic;
    /**
     * @type {Node}
     */
    parent;
    /**
     * @type {HTMLElement}
     */
    elm;

    get static ()
    {
        return this.isStatic;
    }

    set static ( value )
    {
        this.isStatic = value;
    }

    init ()
    {
        return document.createElement( "" );
    }

    /**
     *
     * @param {Node} target
     * @returns
     */
    isInstance ( target )
    {
        // @ts-ignore
        return ( ( this instanceof TNode && target instanceof TNode ) || ( this instanceof ENode && target instanceof ENode ) );
    }

    /**
     * 复制本身
     */
    /**
     * @returns{ENode|TNode}
     */
    clone ()
    {
    }

}
