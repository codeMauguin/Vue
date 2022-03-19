import {Tokenizer} from "./Tokenizer.js";

function ENode(tagName,
               attributes,
               children = []) {
    return {
        tagName,
        attributes,
        children,
    };
}

/**
 *
 * @param {string} string
 */
function AttributeLiteral(string) {
    const attributes =
        /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
    const dynamicAttr = /^(v-|v:|@|:)(?<key>[\w\W]*)/;
    const props = [];
    const dynamic = [];
    let matchAttribute = null,
        dynamicKey;
    while ((matchAttribute = attributes.exec(string)) !== null) {
        let [propertyKey, value] = [
            matchAttribute[1],
            matchAttribute[3] ?? matchAttribute[4] ?? matchAttribute[5],
        ];
        if ((dynamicKey = dynamicAttr.exec(propertyKey)) !== null) {
            dynamic.push([dynamicKey.groups.key, value]);
        } else props.push([propertyKey, value]);
        string = string.slice(matchAttribute[0].length);
    }
    return {props, dynamic};
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

    _lookahead;

    get lookahead() {
        return this._lookahead;
    }

    /**
     * Parser a string into a AST
     * @param {string} String
     */
    parser(string) {
        this._string = string;
        this._tokenizer.init(string);
        this._lookahead = this.tokenizer.getNextToken();
        return this.Literal();
    }

    Literal() {
        if (this.lookahead === null) throw new SyntaxError(`Unexpected stop`);
        switch (this.lookahead.type) {
            case "TEXTNODE":
                return this.TextNodeLiteral();
            case "ELEMENT":
                return this.ElementLiteral();
            case "COMMENT":
                return this.CommentLiteral();
            case "END":
                return this.EOFLiteral();
        }
        throw new SyntaxError(`Literal: unexpected literal production`);
    }

    EOFLiteral() {
        const token = this._eat("END");
        return {
            type: "END",
            value: /^<\/(?<tagName>\w+)>/.exec(token.value.groups.body).groups
                .tagName,
        };
    }

    /**
     * Parser Comment Node
     */
    CommentLiteral() {
        const token = this._eat("COMMENT");
        return {
            type: "COMMENT",
            value: token.value.groups.data,
        };
    }

    /**
     * Parser Element
     * :{body:Array<Element|TextNode>,attributes:obkect}
     */
    ElementLiteral() {
        const token = this._eat("ELEMENT");
        const match = /(?<tagName>\w+)/g;
        const body = token.value.groups.body;
        const tagName = match.exec(body).groups.tagName;
        const BR_MATCH = /^<br>/;
        if (BR_MATCH.test(body)) {
            return {
                type: "ELEMENT",
                value: ENode("br",
                             undefined),
            };
        }
        const attributes = AttributeLiteral(body.slice(match.lastIndex));
        if (/\/>$/.test(body)) {
            return {
                type: "ELEMENT",
                value: ENode(tagName,
                             attributes),
            };
        }
        let children;
        const child = [];
        while ((children = this.Literal()).type !== "END") {
            child.push(children);
        }
        if (children.type !== "END" || children.value !== tagName) {
            throw new SyntaxError(
                `Unexected closed:'${children.value}', start:'${tagName}'`,
            );
        }
        return {
            type: "ELEMENT",
            value: ENode(tagName,
                         attributes,
                         child),
        };
    }

    _eat(tokenType) {
        const token = this.lookahead;
        if (token === null)
            throw new SyntaxError(`Unexected end of input,expected: ${tokenType}`);
        if (tokenType !== token.type)
            throw new SyntaxError(
                `Unexected token: "${token.value}",expected: ${tokenType}`,
            );
        this._lookahead = this.tokenizer.getNextToken();
        return token;
    }

    /**
     * Parser TextNode
     */
    TextNodeLiteral() {
        const token = this._eat("TEXTNODE");
        return {
            type: "TEXTNODE",
            value: token.value.groups.body,
        };
    }
}