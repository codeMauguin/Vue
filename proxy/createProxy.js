import { isNotObject, isObject } from "../util/index.js";
import Vue from "../Vue/Vue.js";

function ƒ ( target )
{
    return new Proxy( target, {
        set ( target, key, value, receiver )
        {
            if ( target[ key ] === value )
            {
                return true;
            } else
            {
                const result = Reflect.set( target, key, value, receiver );
                Vue.dept.notify();
                return result;
            }
        },
    } );
}

export default function createProxy ( target )
{
    if ( isNotObject( target ) )
    {
        console.warn( `${ target } is not a Object!` );
        return undefined;
    }
    for ( const key of Object.keys( target ) )
    {
        if ( isObject( target[ key ] ) )
        {
            target[ key ] = createProxy( target[ key ] );
        }
    }
    return ƒ( target );
}

