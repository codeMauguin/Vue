import { isMustache, isNotNull } from "../util";
import { Tokenizer } from "./Tokenizer.js";

const IS_SELF_TAG =
  /area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr/i;

/**
 *
 * @param {string} string
 */

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

  AttributeLiteral() {
    const dynamicAttr = /^(v-|v:|@|:)(?<key>[\w\W]*)/;
    const props = [];
    const dynamic = [];
    let matchAttribute, dynamicKey;
    while (
      null !== (matchAttribute = this.lookahead) &&
      matchAttribute.type === "ATTRIBUTES"
    ) {
      let [propertyKey, value] = [
        matchAttribute.value[2],
        matchAttribute.value[4] ??
          matchAttribute.value[5] ??
          matchAttribute.value[6],
      ];
      if ((dynamicKey = dynamicAttr.exec(propertyKey)) !== null) {
        switch (dynamicKey.groups?.key) {
          case "if":
          case "else-if":
          case `else`:
          case "for":
            dynamic.push([dynamicKey.groups.key, value]);
            break;
          default:
            props.push([dynamicKey.groups?.key, value, 1]);
        }
      } else props.push([propertyKey, value, 0]);
      this.advance();
    }
    return { attributes: props, props: dynamic };
  }

  init(string) {
    this._string = string;
    this._tokenizer.init(string);
    this._lookahead = this.tokenizer.getNextToken();
  }

  /**
   * Parser a string into a AST
   * @param string
   */
  parser(string) {
    this.init(string);
    return this.Literal();
  }

  next() {
    this._lookahead = this.tokenizer.getNextToken();
  }

  advance() {
    this._lookahead = this.tokenizer.getToken();
  }

  Literal() {
    if (this.lookahead === null) {
      return { type: "END", value: null };
    }
    switch (this.lookahead.type) {
      case "TEXT-NODE":
        return this.TextNodeLiteral();
      case "ELEMENT":
        return this.ElementLiteral();
      case "COMMENT":
        return this.CommentLiteral();
      case "END":
        return this.EOFLiteral();
    }
    throw new SyntaxError(
      `Literal: unexpected literal production:${this.lookahead.type}`,
    );
  }

  EOFLiteral() {
    const token = this._eat("END");
    this.next();
    return {
      type: "END",
      value: token.value.groups.tag,
    };
  }

  /**
   * Parser Comment Node
   */
  CommentLiteral() {
    const token = this._eat("COMMENT");
    this.next();
    return {
      type: "COMMENT",
      value: token.value.groups.data,
    };
  }

  ChildrenLiteral(tagName = null) {
    let child;
    const children = [];
    while ((child = this.Literal()).type !== "END") {
      children.push(child);
    }
    if (child.type !== "END" || child.value !== tagName) {
      throw new SyntaxError(
        `Unexpected closed:'${child.value}', start:'${tagName}'`,
      );
    }
    return children;
  }

  /**
   * Parser Element
   * :{body:Array<Element|TEXT-NODE>,attributes:obkect}
   */
  ElementLiteral() {
    const token = this._eat("ELEMENT");
    this.advance();
    const tagName = token.value.groups.tag;
    const { attributes, props } = this.AttributeLiteral();
    if (IS_SELF_TAG.test(tagName) || this.lookahead.type === "SELF-CLOSE") {
      this.next();
      return {
        type: "ELEMENT",
        value: {
          tagName,
          attributes: { attributes, props },
          children: [],
        },
      };
    } else {
      this.next();
      return {
        type: "ELEMENT",
        value: {
          tagName,
          attributes: { attributes, props },
          children: this.ChildrenLiteral(tagName),
        },
      };
    }
  }

  _eat(tokenType) {
    const token = this.lookahead;
    if (token === null)
      throw new SyntaxError(`Unexpected end of input,expected: ${tokenType}`);
    if (tokenType !== token.type)
      throw new SyntaxError(
        `Unexpected token: "${token.value}",expected: ${tokenType}`,
      );
    return token;
  }

  /**
   * Parser TEXT-NODE
   */
  TextNodeLiteral() {
    const token = this._eat("TEXT-NODE");
    this.next();
    return {
      type: "TEXT-NODE",
      value: [
        token.value.groups?.data ?? token.value.groups.body,
        !isMustache(token.value.groups.body),
      ],
    };
  }
}
