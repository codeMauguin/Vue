const styleKeys = Object.keys( document.documentElement.style );
import { v } from "./index.js";
export function setAttribute ( elm, name, value )
{
  if ( styleKeys.includes( name ) )
  {
    elm.style[ name ] = value;
  } else if ( name === "class" )
  {
    elm.classList.add( value );
  } else
  {
    elm.setAttribute( name, value );
  }
}
export function dispatch ( elm, name, fn )
{
  elm.addEventListener( name, fn );
}
export function create ( node )
{
  if ( node instanceof v )
  {
    const elm = node.elm = document.createElement( node.tagName );
    for ( const [ key, value ] of Object.entries( node.attr ) )
    {
      setAttribute( elm, key, value )
    }
    for ( const [ key, value ] of Object.entries( node.props.attr ) )
    {
      setAttribute( elm, key, value )
    }
    for ( const [ key, fn ] of Object.entries( node.props.methods ) )
    {
      dispatch( elm, key, fn );
    }
    for ( const child of node.children )
    {
      elm.appendChild( create( child ) );
    }
    return elm;
  } else
  {
    const elm = node.elm = document.createTextNode( node.text );
    return elm;
  }
}