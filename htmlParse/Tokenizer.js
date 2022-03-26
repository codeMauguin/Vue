const Spec = [/* Match annotation tag*/
    [/(?<body>^<!--(?<data>[\s\S]*?)-->)/,
     "COMMENT"],
    [/(?<body>^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)(([^<>"'\/=]+)(?:\s*(=)\s*(?:"[^"]*"+|'[^']*'+|[^\s<>\/"']+))?)*\/?>)/i,
     "ELEMENT-SELF"],
    /* Match start label */
    [/(?<body>^<\w+(([^<>"'\/=]+)(?:\s*(=)\s*(?:"[^"]*"+|'[^']*'+|[^\s<>\/"']+))?)*\/?>)/,
     "ELEMENT"],
    [/(?<body>^>)/,
     'TAG-END'],
    /* Match closed label */
    [/(?<body>^<\/[^>]*>)/,
     "END"],
    /* <xxx<div></div> | <axsdxx </div>*/
    [/(?<body>[\s\S]*?)((<\w+(([^<>"'\/=]+)(?:\s*(=)\s*(?:"[^"]*"+|'[^']*'+|[^\s<>\/"']+))?)*\/?>)|(<\/\w+>)|(<!--([\s\S]*?)-->))/,
     "TEXT-NODE"],];

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

    init(string) {
        this._string = string;
        this._cursor = 0;
    }

    match(regexp,
          string) {
        const match = regexp.exec(string);
        if (match === null) return null;
        const length = match.groups.body.length;
        if (length === 0) throw new SyntaxError(`没有匹配到字符`);
        this.cursor += length;
        return match;
    }

    getNextToken() {
        if (!this.hasMoreTokens()) {
            return null;
        }
        const string = this.string.slice(this.cursor);
        for (const [regexp, tokenType] of Spec) {
            const value = this.match(regexp,
                                     string);
            if (value === null) continue;
            return {
                type: tokenType, value,
            };
        }
        throw new SyntaxError(`Unexpected token: ${string}`);
    }

    hasMoreTokens() {
        return this._cursor < this.string.length;
    }
}
