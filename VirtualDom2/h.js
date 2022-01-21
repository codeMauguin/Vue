import { ENode, TNode } from "./index.js";

export default function h ( tagName, attributes, children )
{
    if ( attributes === null && children === null )
    {
        return new TNode( tagName );
    }
    const childrenNodes = new Array( 0 );
    for ( const child of children )
    {
        if ( child instanceof HTMLElement )
        {
            childrenNodes.push( h( child.tagName, child.attributes, child.childNodes ) );
        }
        else if ( child instanceof Comment )
        {
        }
        else
        {
            childrenNodes.push( h( child.textContent, null, null ) );
        }
    }
    return new ENode( tagName, attributes, childrenNodes );
}
