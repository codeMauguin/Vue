class lexer
{
    #buffer;
    pos = 0;
    limit;

    /**
     *
     * @param{String} buffer
     */
    constructor ( buffer )
    {
        this.#buffer = buffer;
        this.limit = buffer.length;
    }

    position ()
    {
        return this.pos;
    }

    /**
     * 读取当前指针${pos}的数值
     * @returns {string}
     */
    peek ()
    {
        return this.#buffer.charAt( Math.max( 0, Math.min( this.pos, this.limit ) ) );
    }

    /**
     * 返回当前指针，指针后移
     * @returns {number|string}
     */
    read ()
    {
        return ( this.pos >= this.limit ) ? -1 : this.#buffer.charAt( this.pos++ );
    }

    back ()
    {
        this.pos = Math.max( 0, this.pos - 1 );
    }
}


const competence = {
    '<': 1 << 0, '>': 1 << 1, ':': 1 << 2, ' ': 1 << 3, '</': 1 << 4, '\'': 1 << 5, '"': 1 << 6
}
const tree = {
    tagName: "", attributes: [], children: [], parent: null
}

class HTMLTree
{
    tagName = "";
    /**
     * @type {any[]}
     */
    attributes = [];
    /**
     * @type {(string | HTMLTree)[]}
     */
    children = [];
    parent = null;
}

class HTMLError extends Error
{
    /**
     * @param {string | undefined} err
     */
    constructor ( err )
    {
        super( err );
    }
}

const openStart = /^<((?:[a-zA-Z_][\-\.0-9_a-zA-Za-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]*\:)?[a-zA-Z_][\-\.0-9_a-zA-Za-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]*)/;

class StringBuffer
{
    #value = [];

    /**
     * @param {any} str
     */
    append ( str )
    {
        this.#value.push( str );
    }

    toString ()
    {
        return this.#value.join( '' );
    }

    clear ()
    {
        this.#value.length = 0;
    }

    length ()
    {
        return this.#value.length;
    }
}

const attribute = {
    key: "", value: ""
}

/**
 * @param {lexer} exe
 */
function parse ( exe )
{
    let expectToken = competence[ '<' ];
    let parent = new HTMLTree();
    let mode = 0;
    const buffer = new StringBuffer();
    P1: while ( true )
    {
        let read = exe.read();
        switch ( read )
        {
            case -1:
                throw new HTMLError( "html text is unclosed" )
            case '<': {
                //先判断 是新的开始还是子节点匹配
                if ( mode === 0 )
                {
                    if ( ( competence[ '<' ] & expectToken ) === 0 )
                    {
                        throw new HTMLError( `bad match < at ${ exe.position() - 1 } position` );
                    }
                    //删除<权限
                    expectToken = ( expectToken & ~competence[ '<' ] );
                } else if ( mode === 1 )
                {
                    if ( buffer.length() > 0 )
                    {
                        parent.children.push( buffer.toString() );
                        buffer.clear();
                    }
                    if ( exe.peek() === '/' )
                    {
                        exe.read();
                        mode++;
                    } else
                    {
                        if ( buffer.length() > 0 )
                        {
                            parent.children.push( buffer.toString() );
                            buffer.clear();
                        }
                        exe.back();
                        let p = parse( exe );
                        p.parent = parent;
                        parent.children.push( p );
                    }
                } else
                {
                    throw new HTMLError( "错误的<" )
                }

            }
                break;
            case '>': {
                if ( mode + 1 === 3 )
                {
                    if ( !parent.tagName === buffer.toString() )
                    {
                        throw new HTMLError( "标签前后闭合不一致" );
                    }
                    break P1;
                }
                if ( mode === 0 )
                {

                    if ( buffer.length() > 0 )
                    {
                        if ( parent.tagName === '' )
                        {
                            parent.tagName = buffer.toString();
                        } else
                        {
                            let att = Object.create( attribute );
                            att.key = buffer.toString();
                            parent.attributes.push( att );
                        }
                    }
                }
                buffer.clear();
                expectToken = ( expectToken & ~competence[ '>' ] ) | competence[ '<' ];
                mode++;
            }
                break;
            case ' ': {
                if ( mode === 0 )
                {
                    if ( parent.tagName === '' )
                    {
                        parent.tagName = buffer.toString();
                        buffer.clear();
                    } else if ( buffer.length() > 0 )
                    {
                        let attr = Object.create( attribute );
                        attr.key = buffer.toString();
                        parent.attributes.push( attr );
                        buffer.clear();
                    }
                    break;
                }
            }
            case '=': {
                if ( mode === 0 )
                {
                    const key = buffer.toString();
                    let attr = Object.create( attribute );
                    attr.key = key;
                    parent.attributes.push( attr )
                    buffer.clear();
                    expectToken = competence[ '\'' ] | competence[ '"' ];
                    break;
                }
            }
            case '\'': {
                if ( mode === 0 )
                {
                    if ( ( expectToken & competence[ '\'' ] ) !== 0 )
                    {
                        if ( expectToken !== competence[ '\'' ] )
                        {
                            expectToken = competence[ '\'' ];
                        } else
                        {
                            parent.attributes[ parent.attributes.length - 1 ].value = buffer.toString();
                            buffer.clear();
                        }
                        break;
                    }
                    throw new HTMLError( "错误匹配 ' 在下标 " + exe.position() );
                }

            }
            case '"': {
                if ( mode === 0 )
                {
                    if ( ( expectToken & competence[ '"' ] ) !== 0 )
                    {
                        if ( expectToken !== competence[ '"' ] )
                        {
                            expectToken = competence[ '"' ];
                        } else
                        {
                            parent.attributes[ parent.attributes.length - 1 ].value = buffer.toString();
                            buffer.clear();
                        }
                        break;
                    }
                    throw new HTMLError( "错误匹配 ' 在下标 " + exe.position() );
                }
            }
            case '/': {
                if ( mode === 0 )
                {
                    if ( exe.peek() === '>' )
                    {
                        if ( buffer.length() > 0 )
                        {
                            if ( parent.tagName === '' )
                            {
                                parent.tagName = buffer.length();
                            } else
                            {
                                let attr = Object.create( attribute );
                                attr.key = buffer.toString();
                                parent.attributes.push( attr );
                            }
                        }
                        break P1;
                    }

                }
            }
            default:
                buffer.append( read );
        }
    }
    console.log( 'buffer:' + buffer.toString() )
    console.log( parent )
    return parent;
}

/**
 * @param {string} htmlText
 */
export default function ( htmlText )
{
    console.log( openStart.exec( htmlText ) );
    console.log( openStart.lastIndex );
    return parse( new lexer( htmlText ) )
}