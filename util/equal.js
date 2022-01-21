import { isObject } from "./index.js";

function* ƒ ( keys, target, source )
{
    for ( let key of keys )
    {
        yield equal( target[ key ], source[ key ] );
    }
}

export default function equal ( target, source )
{
    return (
        target === source ||
        ( typeof target === typeof source
            ? isObject( target )
                ? target.__proto__ === source.__proto__
                    ? ( function ()
                    {
                        const targetKeys = Object.keys( target );
                        const sourceKeys = Object.keys( source );
                        if ( targetKeys.length !== sourceKeys.length )
                        {
                            return false;
                        } else
                        {
                            for ( const Element of ƒ(
                                targetKeys,
                                target,
                                source,
                            ) )
                            {
                                if ( !Element )
                                {
                                    return false;
                                }
                            }
                            return true;
                        }
                    } )()
                    : false
                : false
            : false )
    );
}

/**
 * 比较对象
 * @param {Object} target
 * @param {Object} source
 */
export function diffProps ( target, source )
{
    const newKeys = Object.keys( source );
    const oldKeys = Object.keys( target );
    const newProps = newKeys.filter( x => equal( oldKeys.indexOf( x ), -1 ) );
    const deleteProps = oldKeys.filter( x => equal( newKeys.indexOf( x ), -1 ) );
    const need = newKeys.filter( x => oldKeys.indexOf( x ) > -1 );
    const diffProps = need.filter( key => !equal( target[ key ], source[ key ] ) );
    return {
        same:
            deleteProps.length === 0 &&
            diffProps.length === 0 &&
            newProps.length === 0,
        deleteProps: deleteProps.concat( diffProps ).reduce( ( pre, current ) =>
        {
            Reflect.set( pre, current, target[ current ], pre );
            return pre;
        }, {} ),
        updateProps: newProps.concat( diffProps ).reduce( ( pre, current ) =>
        {
            Reflect.set( pre, current, source[ current ] );
            return pre;
        }, {} ),
    };
}
