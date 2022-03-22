const Spec = [/**
 * Match annotation tag
 */
    [/(?<body>^<!--(?<data>[^]*?)-->)/, "COMMENT"], /**
     * Match start label
     */
    [/(?<body>^<\w+(([^<>"'\/=]+)(?:\s*(=)\s*(?:"[^"]*"+|'[^']*'+|[^\s<>\/"']+))?)*>)/, "ELEMENT"], /**
     * Match self-closed tag
     */
    [/(?<body>^<\w+[^]*?\/>)/, "ELEMENT"], /**
     * Match closed label
     */
    [/(?<body>^<\/[^>]*>)/, "END"], /**
     * <xxx<div></div> | <axsdxx </div>
     */
    [/(?<body>[^]*?)((<\w+[^]*>)|(<\/\w+>)|(<!--[^]*?-->))/, "TEXTNODE"],];

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
        this.cursor += match.groups.body.length;
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
