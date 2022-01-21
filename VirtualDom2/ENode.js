/**
 * @author 陈浩
 * @date 2022-01-16 20:22:42
 * @slogan: Talk is cheap. Show me the code.
 * @Last Modified by: 陈浩
 * @Last Modified time: 2022-01-21 14:28:49
 */
import { Node } from "./index.js";
import { mustache as h } from "../Mustache/index.js";
import { clone as deepClone, isNotNull, isNull } from "../util/index.js";

const forRegExp = /(?<head>\(.*\)|\w+)\s+(?<body>in|of)\s+(?<target>.*)/;
const aliasExp = /(?<=[(|,]).*?(?=[,|)])/gi;


const styleKeys = Object.keys( document.documentElement.style );
export default class ENode extends Node
{
    /**
     * @type {HTMLElement}
     */
    elm;
    nodeType;
    key;
    /**
     * @type {string}
     */
    sel;
    nextHook; //替换节点
    attributes = {};
    dynamicNode = null;
    props = {
        attributes: {},
        method: {},
    };
    #props = {
        attributes: {},
        method: {},
    };
    children;

    /**
     * @param {String} sel
     * @param {{ [s: string]: Attr; } | ArrayLike<Attr>|Object} attributes
     * @param {Array<Node>} children
     */
    constructor ( sel, attributes, children )
    {
        super();
        this.sel = sel;
        this.setAttributes = attributes;
        this.children = children;
        this.children.forEach( ( e ) => ( e.parent = this ) );
    }

    get prop ()
    {
        return this.#props;
    }

    // @ts-ignore
    /**
     * @param {{ [s: string]: Attr; } | ArrayLike<Attr>} attr
     */
    set setAttributes ( attr )
    {
        if ( attr instanceof NamedNodeMap )
        {
            for ( const [ , { name, value } ] of Object.entries( attr ) )
            {
                switch ( true )
                {
                    case /v-bind:/gi.test( name ): {
                        Reflect.set(
                            this.#props.attributes,
                            name.slice( 7 ),
                            value.trim(),
                            this.#props.attributes,
                        );
                    }
                        break;
                    case /@click/gi.test( name ): {
                        Reflect.set(
                            this.#props.method,
                            "click",
                            value.trim(),
                            this.#props.method,
                        );
                    }
                        break;
                    case /@for/gi.test( name ): {
                        this.dynamicTemplate = forAt( value );
                    }
                        break;
                    case /@if|@else|@show|:key/gi.test( name ):
                        this.#props.attributes[ name.slice( 1 ) ] = value.trim();
                        break;
                    default:
                        Reflect.set( this.attributes, name, value.trim(), this.attributes );
                }
            }
        } else this.attributes = attr;
    }

    /**
     * @param {object} context
     */
    render ( context )
    {
        for ( const [ key, value ] of Object.entries( this.#props.attributes ) )
        {
            switch ( key )
            {
                case "show": {
                    const isShow = h( value, {
                        ...context, ...context._data
                    } );
                    if ( isShow === false || isShow === "false" || isShow === "0" )
                    {
                        /**
                         * 含有某些属性，开启缓存,且用户本身含有属性
                         */
                        if ( isNotNull( this.attributes[ "display" ] ) )
                        {
                            //Todo 没有缓冲，开启缓存,后面如果需要，则需要具体判断key缓存是否存在
                            if ( isNull( this.#props.cache ) )
                            {
                                this.#props.cache = {
                                    show: this.attributes[ "display" ],
                                };
                            } else if ( isNull( this.#props.cache[ "show" ] ) )
                                this.#props.cache[ "show" ] = this.attributes[ "display" ];
                        }
                        this.props.attributes[ "display" ] = "none";
                    } else
                    {
                        if ( isNull( this.#props.cache ) || isNull( this.#props.cache.show ) )
                        {
                            this.props.attributes[ "display" ] = "block";
                        } else
                        {
                            this.props.attributes[ "display" ] = this.#props.cache.show;
                        }
                    }
                    break;
                }
                case "key":
                    break;
                case "else": {
                    let condition = this.#props.attributes.else;
                    let valuer = h( condition, {
                        ...context,
                        ...context._data
                    } );
                    if ( valuer === true || valuer === "true" || valuer === "1" )
                    {
                        // @ts-ignore
                        let number = this.parent.children.findIndex( ENode => ENode === this );
                        this.nextHook.render( context );
                        // @ts-ignore
                        this.parent.children.splice( number, 1, this.nextHook );
                    }
                    break;
                }
                case "if": {
                    let condition = this.#props.attributes.if;
                    let valuer = h( condition, { ...context, ...context._data } );
                    console.log( typeof valuer )
                    if ( valuer === false || valuer === "0" )
                    {
                        // @ts-ignore
                        let number = this.parent.children.findIndex( ENode => ENode === this );
                        this.nextHook.render( context );
                        // @ts-ignore
                        this.parent.children.splice( number, 1, this.nextHook );
                    }
                    break
                }
                default: {
                    this.props.attributes[ key ] = h( value,
                        {
                            ...context,
                            ...context._data,
                        }
                    );
                }
            }
        }
        for ( const [ key, value ] of Object.entries( this.#props.method ) )
        {
            if ( isNotNull( this.props.method[ key ] ) )
            {
                continue;
            }
            const methodRegExp =
                /(?<name>\w+)?([(,])(?<arg>.*?)(?=[,)])/g;
            let result = methodRegExp.exec( value );
            let name, args = [];
            do
            {
                // @ts-ignore
                const { groups: { name: N, arg } = { name: undefined } } = result;
                if ( N )
                {
                    name = N;
                }
                if ( arg && arg !== '' )
                {
                    args.push( arg );
                }
            } while ( ( result = methodRegExp.exec( value ) ) !== null );
            const fun = h(
                name,
                {
                    ...context,
                    ...context._methods,
                }
            );
            this.props.method[ key ] = () =>
            {
                const _args = [];
                Array.from( args ).forEach( ( arg ) =>
                {
                    _args.push(
                        h(
                            arg, {
                            ...context,
                            ...context._data,
                        }
                        ),
                    );
                } );
                fun.apply( context, _args );
            };
        }
        if ( isNotNull( this.dynamicTemplate ) )
        {
            //编译生成多个子节点
            // @ts-ignore
            const target = h( this.dynamicTemplate[ "target" ],
                {
                    ...context,
                    ...context._data,
                }
                // @ts-ignore

            );
            let key = this.#props.attributes[ "key" ];
            const child = [];
            // @ts-ignore
            if ( this.dynamicTemplate[ "type" ] === Array )
            {
                Array.from( target ).forEach( ( value, index ) =>
                {
                    const childContext = {
                        // @ts-ignore
                        [ this.dynamicTemplate[ "itemKey" ] ]: value,
                        // @ts-ignore
                        [ this.dynamicTemplate[ "indexKey" ] ]: index,
                    };
                    let privateKey;
                    // @ts-ignore
                    if ( this.dynamicTemplate[ "indexKey" ] === key )
                    {
                        privateKey = index;
                    } else
                    {
                        if ( isNull( value[ key ] ) )
                        {
                            privateKey = h( key, childContext, );
                        } else
                        {
                            privateKey = value[ key ];
                        }
                    }
                    // @ts-ignore
                    this.dynamicNode.forEach(
                        // @ts-ignore
                        (/** @type {{ clone: () => ENode|TNode; }} */ ch ) =>
                        {
                            const clone = ch.clone();
                            clone.key = privateKey;
                            clone.render( childContext );
                            child.push( clone );
                        },
                    );
                    /**
                     * [1,2,3,4],[1,2,3,4],[1,2,3,4]
                     */
                } );
            } else
            {
                const keys = Reflect.ownKeys( target );
                Array.from( keys ).forEach( ( key, index ) =>
                {
                    const childContext = {
                        // @ts-ignore
                        [ this.dynamicTemplate[ "itemKey" ] ]: Reflect.get( target, key, target ),
                        // @ts-ignore
                        [ this.dynamicTemplate[ "nameKey" ] ]: key,
                        // @ts-ignore
                        [ this.dynamicTemplate[ "indexKey" ] ]: index,
                    };
                    // @ts-ignore
                    this.dynamicNode.forEach(
                        (/** @type {{ clone: () => any; }} */ ch ) =>
                        {
                            const clone = ch.clone();
                            clone.render( childContext );
                            child.push( clone );
                        },
                    );
                } );
            }
            //将动态节点挂载
            this.children = child;
        } else
        {
            // @ts-ignore
            this.children.forEach( ( c ) => c.render( context ) );
        }
    }

    init ()
    {
        let dom = document.createElement( this.sel );
        for ( const [ key, value ] of Object.entries( this.attributes ) )
        {
            setAttribute( dom, key, value );
        }
        for ( const [ key, value ] of Object.entries( this.props.attributes ) )
        {
            setAttribute( dom, key, value );
        }
        for ( const [/**@type{HTMLElementEventMap}*/key, value ] of Object.entries( this.props.method ) )
        {
            dom.addEventListener( key,
                value );
        }
        // @ts-ignore
        this.children.forEach( ( child ) => dom.appendChild( child.init() ) );
        this.elm = dom;
        return dom;
    }

    /**
     *
     * @param {ENode|TNode} other
     * @returns {boolean}
     */
    equal ( other )
    {
        // @ts-ignore
        return (
            // @ts-ignore
            this.key === other.key && this.isInstance( other ) && other.sel === this.sel
        );
    }

    clone ()
    {
        const cloneChild = [];
        if ( isNull( this.dynamicTemplate ) )
            this.children.forEach( ( e ) =>
            {
                cloneChild.push( e.clone() );
            } );
        let clone = new ENode( this.sel, this.attributes, cloneChild );
        clone.children.forEach( child => child.parent = clone );
        clone.static = this.static;
        //防止脏数据深度克隆
        clone.props = deepClone( this.props );
        clone.#props = this.#props;
        clone.key = this.key;
        clone.dynamicNode = this.dynamicNode;
        clone.dynamicTemplate = this.dynamicTemplate;
        clone.nextHook = this.nextHook;
        return clone;
    }
}

/**
 * @param {string} value
 */
function forAt ( value )
{
    const forModel = {};
    const foredeck = forRegExp.exec( value );
    // @ts-ignore
    const head = foredeck.groups[ "head" ];
    // @ts-ignore
    const body = foredeck.groups[ "body" ];
    // @ts-ignore
    const target = foredeck.groups[ "target" ];
    if ( isNull( head ) || isNull( body ) || isNull( target ) )
    {
        new Error( "v -for template is error" );
    }
    forModel[ "target" ] = target;
    forModel[ "type" ] = Array;
    const headers = head.match( aliasExp );
    if ( isNull( headers ) )
    {
        forModel[ "itemKey" ] = head;
    } else
    {
        // @ts-ignore
        if ( headers.length === 1 )
        {
            // @ts-ignore
            forModel[ "itemKey" ] = headers[ 0 ];
            // @ts-ignore
        } else if ( headers.length === 2 )
        {
            // @ts-ignore
            forModel[ "itemKey" ] = headers[ 0 ];
            // @ts-ignore
            forModel[ "indexKey" ] = headers[ 1 ];
        } else
        {
            // @ts-ignore
            forModel[ "itemKey" ] = headers[ 0 ];
            // @ts-ignore
            forModel[ "nameKey" ] = headers[ 1 ];
            // @ts-ignore
            forModel[ "indexKey" ] = headers[ 2 ];
            forModel[ "type" ] = Object;
        }
    }
    return forModel;
}

export function setAttribute ( dom, key, value )
{
    if ( styleKeys.includes( key ) )
    {
        dom.style[ key ] = value;
    } else if ( key === "class" )
    {
        dom.classList.add( value );
    } else
    {
        dom.setAttribute( key, value );
    }
}
