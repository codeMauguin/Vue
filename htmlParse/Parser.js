import {Tokenizer} from "./Tokenizer.js";
import {isNotNull} from "../util";


/**
 *
 * @param {string} string
 */
function AttributeLiteral(string) {
    const attributes = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
    const dynamicAttr = /^(v-|v:|@|:)(?<key>[\w\W]*)/;
    const props = [];
    const dynamic = [];
    let matchAttribute, dynamicKey;
    let type = 'ELEMENT';
    while (null !== (matchAttribute = attributes.exec(string))) {
        let [propertyKey, value] = [matchAttribute[1],
                                    matchAttribute[3] ?? matchAttribute[4] ?? matchAttribute[5],];
        if ((dynamicKey = dynamicAttr.exec(propertyKey)) !== null) {
            switch (dynamicKey.groups.key) {
                case "if":
                case "else-if":
                case `else`:
                case "for":
                case "key":
                    dynamic.push([dynamicKey.groups.key,
                                  value]);
                    break;
                default:
                    props.push([dynamicKey.groups.key,
                                value,
                                1]);
            }
        } else props.push([propertyKey,
                           value,
                           0]);
        string = string.slice(matchAttribute[0].length);
    }
    return {attributes: props, props: dynamic, type};
}

export class Parser {
    _string = "";

    get string() {
        return this._string;
    }

    _tokenizer = new Tokenizer();

    get tokenizer() {
        return this._tokenizer;
    }

    get hasNext() {
        return isNotNull(this.lookahead);
    }

    _lookahead;

    get lookahead() {
        return this._lookahead;
    }

    /**
     * Parser a string into a AST
     * @param string
     */
    parser(string) {
        this._string = string;
        this._tokenizer.init(string);
        this._lookahead = this.tokenizer.getNextToken();
        return this.Literal();
    }

    SelfElementLiteral() {
        const token = this._eat("ELEMENT-LINE");
        const match = /(?<tagName>\w+)/g;
        const body = token.value.groups.body;
        const tagName = match.exec(body).groups.tagName;
        const {
            attributes,
            props,
            type
        } = AttributeLiteral(body.slice(match.lastIndex));
        return {
            type,
            value: {
                tagName, attributes: {attributes, props}, children: [],
            }
        }
    }

    Literal() {
        if (this.lookahead === null) throw new SyntaxError(`Unexpected stop`);
        switch (this.lookahead.type) {
            case "TEXT-NODE":
                return this.TextNodeLiteral();
            case "ELEMENT":
                return this.ElementLiteral();
            case "COMMENT":
                return this.CommentLiteral();
            case "END":
                return this.EOFLiteral();
            case "ELEMENT-LINE":
                return this.SelfElementLiteral();
        }
        throw new SyntaxError(`Literal: unexpected literal production:${this.lookahead.type}`);
    }

    EOFLiteral() {
        const token = this._eat("END");
        return {
            type: "END", value: /^<\/(?<tagName>\w+)>/.exec(token.value.groups.body).groups.tagName,
        };
    }

    /**
     * Parser Comment Node
     */
    CommentLiteral() {
        const token = this._eat("COMMENT");
        return {
            type: "COMMENT", value: token.value.groups.data,
        };
    }

    /**
     * Parser Element
     * :{body:Array<Element|TEXT-NODE>,attributes:obkect}
     */
    ElementLiteral() {
        const token = this._eat("ELEMENT");
        const match = /(?<tagName>\w+)/g;
        const body = token.value.groups.body;
        const tagName = match.exec(body).groups.tagName;
        const {
            attributes,
            props,
            type
        } = AttributeLiteral(body.slice(match.lastIndex));
        let child;
        const children = [];
        while ((child = this.Literal()).type !== "END") {
            children.push(child);
        }
        if (child.type !== "END" || child.value !== tagName) {
            throw new SyntaxError(`Unexpected closed:'${child.value}', start:'${tagName}'`,);
        }
        return {
            type : type,
            value: {
                tagName, attributes: {attributes, props}, children,
            },
        };
    }

    _eat(tokenType) {
        const token = this.lookahead;
        if (token === null) throw new SyntaxError(`Unexected end of input,expected: ${tokenType}`);
        if (tokenType !== token.type) throw new SyntaxError(`Unexected token: "${token.value}",expected: ${tokenType}`,);
        this._lookahead = this.tokenizer.getNextToken();
        return token;
    }

    /**
     * Parser TEXT-NODE
     */
    TextNodeLiteral() {
        const token = this._eat("TEXT-NODE");
        return {
            type: "TEXT-NODE", value: token.value.groups.body,
        };
    }
}
