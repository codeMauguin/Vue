// @ts-ignore
const Task = ( /**@type {(arg0:any)=>any}*/then ) => ( {
    then,
    map: ( /** @type {(arg0: any) => any} */ action ) =>
        Task( ( /** @type {(arg0: any) => any} */ resolve ) =>
            then(
                ( /** @type {boolean|any} */ success ) => resolve( success === false ? false : action( success ) )
            ),
        ),
    filter: ( /** @type {(arg0: any) => boolean} */ predicate ) => Task( ( /** @type {(arg0: any) => any} */ res ) => then( ( /** @type {any} */ suc ) => res( predicate( suc ) === true ? suc : false ) ) ),
} );
export default class Arrays
{
    #array = [];

    constructor ( array )
    {
        this.#array.push( ...array );
    }
    #taskArray = [];
    #task = Task( exe => exe( this.#taskArray.shift() ) );
    map ( action )
    {
        this.#task = this.#task.map( action );
        return this;
    }
    filter ( predicate )
    {
        this.#task = this.#task.filter( predicate );
        return this;
    }

    static stream ( array )
    {
        return new Arrays( array );
    }
    offer ( item )
    {
        this.#array.push( item );
        return this;
    }
    findFirst ()
    {
        let result = undefined;
        while ( this.#array.length > 0 )
        {
            this.#taskArray.push( this.#array.shift() );
            this.#task.then( (/** @type {any} */ r ) =>
            {
                result = r;
            } );
            if ( isNotNull( result ) && result !== false )
            {
                break;
            }
            result = undefined;
        }
        return ( {
            get () { return result }, /**
             * @param {any} other
             */
            orElse ( other )
            {
                return isNotNull( result ) ? result : other
            }
        } )
    }
}