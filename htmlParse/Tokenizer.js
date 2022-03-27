import { warn } from "../log";
import { Assert } from "../util";

const unicodeRegExp =
  /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
const noname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`;
const startTagOpen = new RegExp(`(?<body>^<(?<tag>${noname}))`);
const startTagEnd = /(?<body>^>|^\s+>)/;
const startSelfTagEnd = /(?<body>^\/>|^\s+\/>)/;
const attributes =
  /(?<body>^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?)/;
const AttrSpec = [
  [attributes, "ATTRIBUTES"],
  [startSelfTagEnd, "SELF-CLOSE"],
  [startTagEnd, "ELEMENT-CLOSE"],
];
/**
 * @type{(RegExp|string)[][]}
 */
const Spec = [
  [/(?<body>^<!--(?<data>[\s\S]*?)-->)/, "COMMENT"],
  [startTagOpen, "ELEMENT"],
  [/(?<body>^<\/(?<tag>[^>]*)>)/, "END"],
  [/(?<body>^{{(?<data>[\s\S]*?)}})/, "TEXT-NODE"],
  [/(?<body>^\${(?<data>[\s\S]*?)})/, "TEXT-NODE"],
  [/(?<body>[\s\S]*?(?=<\/\w+|<!--|<\w+|{{|\${))/, "TEXT-NODE"],
];

export class Tokenizer {
  _string;

  /**
   * @returns {string}
   */
  get string() {
    return this._string;
  }

  _cursor;

  get cursor() {
    return this._cursor;
  }

  set cursor(value) {
    this._cursor = value;
  }

  /**
   * @param {string} string
   */
  init(string) {
    this._string = string;
    this._cursor = 0;
  }

  /**
   * @param { RegExp} regexp
   * @param {string} string
   */
  match(regexp, string) {
    const match = regexp.exec(string);
    if (match === null) return null;
    this.advance(match.groups?.body.length);
    return match;
  }

  getToken() {
    if (!this.hasMoreTokens()) return null;
    const string = this.string.slice(this.cursor);
    for (const [regexp, tokenType] of AttrSpec) {
      const value = this.match(regexp, string);
      if (value) {
        return {
          type: tokenType,
          value,
        };
      }
    }
    return null;
  }

  advance(length) {
    this.cursor += Assert(length, `没有匹配到字符`, warn, SyntaxError) ?? 1; //防止死循环，每次进一
  }

  getNextToken() {
    if (!this.hasMoreTokens()) {
      return null;
    }
    const string = this.string.slice(this.cursor);
    for (const [/**@type {RegExp}*/ regexp, tokenType] of Spec) {
      const value = this.match(regexp, string);
      if (value === null) continue;
      return {
        type: tokenType,
        value,
      };
    }
    this.advance(string.length);
    return {
      type: "TEXT-NODE",
      value: { groups: { body: string } },
    };
  }

  hasMoreTokens() {
    return this._cursor < this.string.length;
  }
}
