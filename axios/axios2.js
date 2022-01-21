import { isNotNull, isNull, isString } from "../util/index.js";

const DEFAULT_REJECT = err => Promise.reject( err ),
    DEFAULT_RESOLVE = suc => Promise.resolve( suc );
const Task = then => ( {
    then,
    map: ( mapResolve = DEFAULT_RESOLVE, mapReject = DEFAULT_REJECT ) =>
        Task( ( resolve = DEFAULT_RESOLVE, reject = DEFAULT_REJECT ) =>
            then(
                success => resolve( mapResolve( success ) ),
                error => reject( mapReject( error ) ),
            ),
        )
} );
class Tasks
{
    #sucArray = [];
    #rejectArray = []
    #task = Task( ( resolve, reject ) =>
    {
        if ( this.#sucArray.length > 0 )
        {
            resolve( this.#sucArray.shift() );
        } else if ( this.#rejectArray.length > 0 )
        {
            reject( this.#rejectArray.shift() );
        }
    } );

    map ( resolve, reject )
    {
        this.#task = this.#task.map( resolve, reject );
        return this;
    }
    executor ( resolve, reject )
    {
        if ( isNotNull( resolve ) )
        {
            this.#sucArray.push( resolve );
        } else if ( isNotNull( reject ) )
        {
            this.#rejectArray.push( reject );
        }
        let sucResult = null, rejectResult = null;
        this.#task.then( resolve =>
        {
            sucResult = resolve;
        }, reject =>
        {
            rejectResult = reject;
        } );
        return isNotNull( sucResult ) ? sucResult : rejectResult;
    }

}

class Processor
{
    default;
    requestTask = new Tasks();
    responseTask = new Tasks();
    interceptors;
    constructor ( config )
    {
        const that = this;
        this.interceptors = ( {
            request: {
                use ( successCallback, errorCallback )
                {
                    that.requestTask.map( successCallback, errorCallback );
                }
            }, response: {
                use ( successCallback, errorCallback )
                {
                    that.responseTask.map( successCallback, errorCallback )
                }
            }
        } );
        this.default = {
            // @ts-ignore
            set baseURL ( url )
            {
                if ( isString( url ) )
                {
                    // @ts-ignore
                    let index = this._baseURL.findIndex( r => r.name === "default" );
                    if ( index > -1 )
                    {
                        // @ts-ignore
                        this._baseURL[ index ].url = url;
                    } else
                    {
                        // @ts-ignore
                        this._baseURL.push( {
                            // @ts-ignore
                            name: "default",
                            // @ts-ignore
                            url
                        } );
                    }
                } else
                {
                    // @ts-ignore
                    let { name, url } = { name: url.name, url: url.url };
                    // @ts-ignore
                    let index = this._baseURL.findIndex( r => r.name === name );
                    if ( index > -1 )
                    {
                        // @ts-ignore
                        this._baseURL[ index ].url = url;
                    } else
                    {
                        // @ts-ignore
                        this._baseURL.push( { name, url } );
                    }
                }

            },
            get baseURL ()
            {
                if ( this._baseURL.length === 0 )
                {
                    return "";
                }
                // @ts-ignore
                return this._baseURL.find( r => r.name === "default" ).url;
            },
            _baseURL: [],
            // @ts-ignore
            timeout: 3000,
            get ( name )
            {
                if ( isNull( name ) )
                {
                    return this.baseURL;
                }
                //@ts-ignore
                return this._baseURL.find( r => r.name === name ).url;
            }
        }
        if ( isString( config ) )
        {
            this.default.baseURL = config;
        } else
        {
            let { baseURL = "", timeout = 3000 } = config;
            this.default.baseURL = baseURL;
            this.default.timeout = timeout;
        }
    }
    // @ts-ignore
    request ( config )
    {
        const filter = this.requestTask.executor( { url: config[ "url" ], ...config }, null ) || {};
        let group = filter[ "group" ];
        let url = `${ this.default.get( group ) }${ filter[ "url" ] }`;
        let timeout = filter[ "timeout" ];
        if ( isNull( timeout ) )
        {
            timeout = this.default.timeout;
        }
        let body = filter[ "body" ];
        // @ts-ignore
        const about = new AbortController();
        // @ts-ignore
        let timer = new Promise( ( resolve, reject ) =>
        {
            setTimeout( () =>
            {
                about.abort();
                reject( {
                    message: `请求已经超时,timeout:${ timeout }`,
                    errorCode: 500
                } );
            }, timeout );
        } );
        return Promise.race( [ timer, fetch( url, {
            body: filter[ "method" ] === "GET" ? null : body, signal: about.signal,
            ...filter
        } ) ] ).then( suc =>
        {
            console.log( suc.status );
            if ( suc.status === 200 )
                return this.responseTask.executor( suc, null );
            else
            {
                return Promise.reject( this.responseTask.executor( null, suc ) );
            }
        }, reason =>
        {
            if ( reason.errorCode === 500 )
                return Promise.reject( this.requestTask.executor( null, reason ) );
            return Promise.reject( this.responseTask.executor( null, reason ) );
        } );
    }
}


export default class extends Processor
{
    constructor ( config )
    {
        super( config );
    }
    get ( url, config )
    {
        return super.request( {
            url,
            ...config, method: "GET"
        } )
    }
    post ( url, config )
    {
        return super.request( {
            url,
            ...config, method: "POST"
        } )
    }
}