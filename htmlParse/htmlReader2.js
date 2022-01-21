const htmlParse = html =>
{

    function advance ( progress )
    {
        html = html.substring( progress );
    }

    const openStart = /^<((?:[a-zA-Z_][\-.0-9_a-zA-Za-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]*:)?[a-zA-Z_][\-.0-9_a-zA-Za-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]*)/;
    const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
    const dynamicAttribute = /^\s*((@bind:|@)\S*)(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+))?/
    const endTag = /^<\/((?:[a-zA-Z_][\-.0-9_a-zA-Za-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]*:)?[a-zA-Z_][\-.0-9_a-zA-Za-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]*)[^>]*>/;
    const selfClosingLabel = /^\/>/
    const openClose = /^>/;
    const comment = /^<!--/
    const textAlign = /^[\w\W]*?(?=<)/;

    function parse ()
    {
        const nodeInformation = {
            tagName: undefined, attr: {}, props: {}, children: []
        };
        let mode = 0;
        while ( html.length > 0 )
        {
            let result;
            if ( ( result = html.match( openStart ) ) !== null )
            {
                // @ts-ignore
                if ( mode === 0 )
                {
                    nodeInformation.tagName = result[ 1 ];
                    advance( result[ 0 ].length );
                } else
                {
                    nodeInformation.children.push( parse() );
                }
            } else if ( mode === 0 && ( result = html.match( dynamicAttribute ) ) !== null )
            {
                dynamicProps( nodeInformation, result );
            } else if ( mode === 0 && ( result = html.match( attribute ) ) !== null )
            {
                do
                {
                    let re;
                    if ( ( re = html.match( dynamicAttribute ) ) !== null )
                    {
                        dynamicProps( nodeInformation, re );
                        continue;
                    }
                    nodeInformation.attr[ result[ 1 ] ] = result[ 3 ]
                    advance( result[ 0 ].length );
                } while ( ( result = html.match( attribute ) ) != null );
            } else if ( ( result = html.match( openClose ) ) )
            {
                mode++;
                advance( 1 );
            } else if ( mode === 0 && html.match( selfClosingLabel ) )
            {
                break;
            } else if ( html.match( comment ) )
            {
                const progress = html.indexOf( "-->" );
                advance( progress + 3 );
            } else if ( ( result = html.match( endTag ) ) )
            {
                if ( result[ 1 ] !== nodeInformation.tagName )
                {
                    console.warn( "Matching node information is inconsistent" )
                }
                advance( result[ 0 ].length );
                break;
            } else if ( ( result = html.match( textAlign ) ) != null )
            {
                nodeInformation.children.push( result[ 0 ] );
                advance( result[ 0 ].length );
            }
        }
        return nodeInformation;
    }

    /**
     * @param {{ tagName?: undefined; attr?: {}; props: any; children?: never[]; }} nodeInformation
     * @param {(string | any[])[]} result
     */
    function dynamicProps ( nodeInformation, result )
    {
        do
        {
            nodeInformation.props[ result[ 1 ].slice( result[ 2 ].length ) ] = result[ 4 ];
            advance( result[ 0 ].length );
        } while ( ( result = html.match( dynamicAttribute ) ) !== null )
    }

    return parse();
}
export default htmlParse;
