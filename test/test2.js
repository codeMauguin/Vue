const stencilRegexp = /{{(.+?)}}|\${(.+?)}/g;
function* exec ( text )
{
  let result;
  if ( ( result = stencilRegexp.exec( text ) ) != null )
  {
    yield { index: result.index, deleted: result[ 0 ].length, stencil: result[ 1 ] ?? result[ 2 ] }
  }
}
let stencil = "";
let index = 0;
let result, done;
let text = "{{text}}-{{ds}}-s${ds},,"
while ( ( { value: result, done } = exec( text ).next() ) && result != null )
{
  console.log( result );
  if ( result.index > index )
  {
    stencil += `"${ text.slice( index, result.index ) }"+_v(${ result.stencil })`
  } else
  {
    stencil += `_v(${ result.stencil })`;
  }
  index += result.deleted + result.index
  stencil += "+";
}
console.log( stencil );

function textAt ( text )
{
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
      str = match[ 1 ] ?? match[ 2 ];
      if ( match.index > index )
      {
        stencil += `"${ text.slice( index, match.index ) }" + ` + `_v( ${ str } )`
      } else
      {
        stencil += `_v( ${ str } )`
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
  } else return `${ text } `;
  // console.log( stencil );
  return stencil;
}