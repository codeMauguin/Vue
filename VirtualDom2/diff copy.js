import { ENode, setAttribute } from "./index.js";
import { isNotNull, isNull } from "../util/index.js"

function insertBefore ( elm, newElm, oldElm )
{
    elm.insertBefore( newElm, oldElm );
}

/**
 * @param {{ isInstance: (arg0: any) => any; equal: (arg0: any) => any; }} node1
 * @param {any} node2
 */
function same ( node1, node2 )
{
    return node1.isInstance( node2 ) && node1.equal( node2 );
}

/**
 * @param {HTMLElement} parenElm
 * @param { Array<ENode|TNode>} oldNode
 * @param { any[]} newNode
 */
export function diff ( parenElm, oldNode, newNode )
{
    let oldStartIndex = 0;
    let oldEndIndex = oldNode.length - 1;
    let newStartIndex = 0;
    let newEndIndex = newNode.length - 1;
    let oldStart = oldNode[ oldStartIndex ];
    let oldEnd = oldNode[ oldEndIndex ];
    let newStart = newNode[ newStartIndex ];
    let newEnd = newNode[ newEndIndex ];
    while ( oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex )
    {
        if ( isNull( oldStart ) )
        {
            oldStart = oldNode[ ++oldStartIndex ];
        } else if ( isNull( oldEnd ) )
        {
            oldEnd = oldNode[ --oldEndIndex ];
        } else if ( same( oldStart, newStart ) )
        {
            patchNode( oldStart, newStart );
            oldStart = oldNode[ ++oldStartIndex ];
            newStart = newNode[ ++newStartIndex ];
        } else if ( same( oldEnd, newEnd ) )
        {
            patchNode( oldEnd, newEnd );
            oldEnd = oldNode[ --oldEndIndex ];
            newEnd = newNode[ --newEndIndex ];
        } else if ( same( oldStart, newEnd ) )
        {
            patchNode( oldStart, newEnd );
            insertBefore( parenElm, oldStart.elm, oldEnd.elm.nextSibling );
            oldStart = oldNode[ ++oldStartIndex ];
            newEnd = newNode[ --newEndIndex ];
        } else if ( same( oldEnd, newStart ) )
        {
            patchNode( oldEnd, newStart );
            insertBefore( parenElm, oldEnd.elm, oldStart.elm );
            oldEnd = oldNode[ --oldEndIndex ];
            newStart = newNode[ ++newStartIndex ];
        } else
        {
            let os = oldStartIndex;
            let od = oldEndIndex;
            while ( ++os <= od )
            {
                if ( isNotNull( oldNode[ os ] ) && same( oldNode[ os ], newStart ) )
                {
                    break;
                }
            }
            if ( os > od )
            {
                //创建
                const elm = newStart.init();
                insertBefore( parenElm, elm, oldStart.elm )
            } else
            {
                patchNode( oldNode[ os ], newStart );
                insertBefore( parenElm, newStart.elm, oldStart.elm )
                oldNode[ os ] = undefined;
            }
            newStart = newNode[ ++newStartIndex ];
        }
    }
    if ( oldStartIndex > oldEndIndex )
    {
        for ( let i = newStartIndex; i <= newEndIndex; i++ )
        {
            insertBefore( parenElm, newNode[ i ].init(), newNode[ i - 1 ].elm.nextSibling )
        }

    } else
    {
        console.log( 7 );
        for ( let i = oldStartIndex; i <= oldEndIndex; i++ )
        {
            parenElm.removeChild( oldNode[ i ].elm );
        }
    }
}

/**
 * @param {ENode | TNode} oldNode
 * @param {ENode | TNode} newNode
 */
export function patchNode ( oldNode, newNode )
{
    if ( oldNode === newNode ) return;
    const elm = newNode.elm = oldNode.elm;
    if ( newNode instanceof ENode )
    {
        if ( newNode.static )
        {
            //nothing to do
        } else
        {
            let oldAttr = oldNode.props;
            //比较更新props
            for ( const [ key, value ] of Object.entries( newNode.props.attributes ) )
            {
                if ( Reflect.has( oldAttr.attributes, key ) )
                {
                    if ( oldAttr.attributes[ key ] !== value )
                        if ( key === "class" )
                        {
                            let attribute = oldAttr.attributes[ key ];
                            elm.classList.remove( attribute.split( " " ) );
                            elm.classList.add( value.split( " " ) );
                        } else
                            setAttribute( elm, key, value );
                    Reflect.deleteProperty( oldAttr.attributes, key );
                } else
                {
                    setAttribute( elm, key, value );
                }
            }
            Object.keys( oldAttr.attributes ).forEach( r => elm.removeAttribute( String( r ) ) );
            //更新children
        }
        //@ts-ignore
        //更新children
        if ( newNode.children.length > 0 )
            //@ts-ignore
            if ( oldNode.children.length > 0 )
                //@ts-ignore
                diff( elm, oldNode.children, newNode.children );
            else
            {
                newNode.children.forEach( child =>
                {
                    //@ts-ignore
                    elm.appendChild( child.init() );
                } )
            }
        //@ts-ignore
        else if ( oldNode.children.length > 0 )
        {
            //@ts-ignore
            /** @type {{children:Array<ENode>}}*/oldNode.children.forEach( (/** @type {{ elm: HTMLElement; }} */ ch ) => elm.removeChild( ch.elm ) );
        }
    } else
    {
        // @ts-ignore
        if ( oldNode.text !== newNode.text )
        {
            elm.innerText = newNode.text;
        }
    }

}
