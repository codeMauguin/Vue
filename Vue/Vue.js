import { isFunction, isNotString, isNull } from "../util/index.js";
import { createProxy } from "../proxy/index.js";
import { deepReadOnly, readonly } from "../proxy/index.js";
import { dept } from "../watcher/index.js";
import { h, patchNode as patch, compile, ENode, TNode } from "../VirtualDom2/index.js"
const emptyObject = Object.freeze( {} );
function mount ( properties )
{
    properties.ref = function ( target )
    {
        return this.reactive( { value: target } );
    };
    properties.reactive = function ( target )
    {
        return createProxy( target );
    };
    properties.readonly = readonly;
    properties.deepReadOnly = deepReadOnly;
    /**
     * 初始化Options属性
     * @param {Object} Options
     */
    properties.initialization = function ( Options )
    {
        this._Options = Options;
        const keys = Object.keys( Options );
        for ( const key of keys )
        {
            switch ( key )
            {
                case "data": {
                    if ( isFunction( Options[ key ] ) )
                    {
                        this._data = Options[ key ].call( this, this );
                    } else
                    {
                        console.warn( "data is preferably a function" );
                        this._data = Options[ key ];
                    }
                }
                    break;
                case "create": {
                    if ( isFunction( Options[ key ] ) ) this._create = Options[ key ];
                }
                    break;
                case "methods": {
                    this._methods = Options[ key ];
                }
                    break;
                case "mounted": {
                    if ( isFunction( Options[ key ] ) ) this._mounted = Options[ key ];
                }
                    break;
            }
        }
    };
    /**
     * 挂载节点
     * @param {string} el 节点信息
     * @param context
     */
    properties.mount = function ( el, /**@type{ProxyHandler<Vue>}*/context )
    {
        if ( isNotString( el ) )
        {
            console.warn( "el is not specification" );
        }
        const dom = document.querySelector( el );
        if ( dom === null )
        {
            console.warn( "没有节点" )
            return;
        }
        // console.log(dom.outerHTML)
        // htmlReader(dom.outerHTML)
        this[ AST ] = new Function( "target", `with(target){return ${ h( dom.tagName, dom.attributes, dom.childNodes ) }}` )
        const virtualDom = this[ AST ]( context );
        compile( virtualDom, context );
        dom.parentElement?.replaceChild( virtualDom.init(), dom );
        this.virtualDom = virtualDom;
        // @ts-ignore
        context.whether = true;
    };
    /**
     * 收集更新信息，进行更新
     */
    properties.useTask = false;
    properties.task = [];
    properties.update = function ()
    {
        // @ts-ignore
        this.task.push( this );
        if ( this.useTask === false )
        {
            //@ts-ignore
            this.useTask = true;
            Promise.resolve().then( callback.bind( this ) );
        }
    };

    function callback ()
    {
        console.log( "更新" );
        // @ts-ignore
        this.task.length = 0;
        // @ts-ignore
        const oldNode = this.virtualDom;
        // @ts-ignore
        this.virtualDom = this[ AST ]( this );
        compile( this.virtualDom, this );
        patch( oldNode, this.virtualDom );
        // @ts-ignore
        if ( this.task.length > 0 )
        {
            callback.apply( this )
        } else
        {
            this.useTask = false;
        }
    }
    properties._c = function ( sel, attributes, children ) { return new ENode( sel, attributes, children ) }
    properties._t = function ( text )
    {
        return new TNode( text );
    }
}

/**
 * create:视图未更新时调用
 * mounted:视图已经加载完毕使用，建议初始化数据在create中使用
 */
const AST = Symbol( "AST" );
class Vue
{
    [ AST ];
    _data = emptyObject;
    _methods = emptyObject;
    _create = undefined;
    _mounted = undefined;
    static dept;
    static id;
    uid;
    constructor ( options )
    {
        //读取属性
        // @ts-ignore
        this.initialization( options );
        const context = new Proxy( this, {
            get ( target, key, receiver )
            {
                return ( Reflect.get( target, key, receiver ) ?? Reflect.get( target._data, key, target._data ) ?? Reflect.get( target._methods, key, target._methods ) );
            }, set ( target, key, value, receiver )
            {
                if ( Reflect.has( target, key ) )
                {
                    return Reflect.set( target, key, value, receiver );
                } else if ( Reflect.has( target._data, key ) )
                {
                    return Reflect.set( target._data, key, value, target._data );
                } else
                {
                    return true;
                }
            },
        } );
        // @ts-ignore
        this._create?.call( context );
        if ( isNull( options.el ) )
        {
            console.error( `没有节点信息` );
            // @ts-ignore
            return undefined;
        }
        //挂载虚拟dom
        // @ts-ignore
        this.mount( options.el, context );
        // @ts-ignore
        this._mounted?.call( context );
        Vue.dept.add( context );
        this.uid = Vue.id++;
        return context;
    }
}

mount( Vue.prototype );
Vue.dept = dept;
export default Vue;
