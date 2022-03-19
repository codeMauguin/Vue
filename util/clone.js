import { isArray, isNull, clone as h, isNotObject } from "./index.js";
import { isFunction } from "./Type.js";

export default function ( target )
{
    if ( isNull( target ) )
    {
        console.warn( "target is null" );
    }
    if ( isNotObject( target ) || isFunction( target ) )
    {
        return target;
    }
    if ( isArray( target ) )
    {
        const clone = [];
        Array.from( target ).forEach( r =>
        {
            clone.push( h( r ) );
        } );
        return clone;
    } else
    {
        const clone = {};
        const keys = Reflect.ownKeys( target );
        keys.forEach( key =>
        {
            Reflect.set( clone, key, h(
                Reflect.get( target, key, target )
            ), clone );
        } );
        
        return clone;
    }

}