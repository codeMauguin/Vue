import ViewRender from "./ViewRender.js";

//Todo 类型会被转换为string 使用模版解析时
/**
 * @param {string} stencil
 * @param {{ [x: string]: any; }} view
 */
export default function mustache ( stencil, view )
{
    return h.call( { ...view, _v: h.bind( view ) }, ProcessingText( stencil ) );
}

export function ProcessingText ( text )
{
    const stencilRegexp = /{{(.+?)}}|\${(.+?)}/g;
    let match;
    let stencil = "";
    let index = 0;
    if ( ( match = stencilRegexp.exec( text ) ) !== null )
    {
        do
        {
            // s l
            let str;
            let lastIndex = stencilRegexp.lastIndex;
            if ( ( str = match[ 1 ] ) === undefined )
            {
                str = match[ 2 ];
            }
            if ( match.index > index )
            {
                stencil += `"${ text.slice( index, match.index ) }"+` + `_v(${ str })`
            } else
            {
                stencil += `_v(${ str })`
            }
            if ( ( match = stencilRegexp.exec( text ) ) !== null )
            {
                stencil += "+";
                index = lastIndex;
            } else if ( lastIndex < text.length )
            {
                stencil += `+ "${ text.slice( lastIndex, text.length ) }"`
                break;
            } else
            {
                break;
            }
        } while ( true )
    } else return `${ text }`;
    // console.log( stencil );
    return stencil;
}

/**
 * 将模版解析
 * @param {string} stencil
 * @returns object
 */
function h ( stencil )
{
    return ViewRender( stencil, this );
}
