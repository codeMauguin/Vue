//import {warn} from "../../log";

function warn() {
}

const template = ` <p :class="div">{{state}}</p>
    s{{ isShow?true:false }}s
    <div @for="(item,index) in array">
        <div :key="item.id" :ref="test" @for="(item,index) in item">
            <p class="p">{{item}}-{{index}}ss</p>
        </div>
    </div>
    <div @for="(item,name,index) in hobby">
        <p>{{item}}-\${name}-\${index}</p>
        <button @click="add(,id)">测试</button>
    </div>
    <button @click="add(id)">添加</button>
    <div @if="isShow?false:true">wo是True</div>
    <div @else-if="isShow?false:false">wo是else-if</div>
    <div @else-if="isShow?true:false">wo是else-2-if</div>
    <div @else>wo是False</div>`;
const attributes = /(?<body>^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?)/;
const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`
const startTagOpen = new RegExp(`(?<body>^<${ncname})`);
const startTagEnd = /(?<body>^>|^\s+>)/
const startLineTagEnd = /(?<body>^\/>|^\s+\/>)/
const textNode = /(?<body>[\s\S]*?)(<((\w*)|(\/)))/
const EOF = /(?<body>^<\/\w+>)/
const comment = /(?<body>^<!--(?<data>[\s\S]*?)-->)/
const dynamicAttr = /^(v-|v:|@|:)(?<key>[\w\W]*)/;
const spec = [[comment,
               0],
              [startLineTagEnd,
               1],
              [startTagEnd,/*end*/
               2],
              [startTagOpen,
               3],
              [attributes,
               4],
              [EOF,
               5],
              [textNode,
               6]];
const tokenizer = {
    comment : 0, startLineTagEnd: 1, startTagEnd: 2, startTagOpen: 3, attributes: 4, EOF: 5,
    textNode: 6
}

function match(regExp,
               string) {
    const match = regExp.exec(string);
    if (match === null) return null;
    return match;
}

function advanceBy(expect,
                   tokenizer) {
    const adaptation = expect.map(i => spec[i]);
    for (const [regExp, type] of adaptation) {
        let regExpExecArray = match(regExp,
                                    tokenizer);
        if (regExpExecArray === null) continue;
        return {
            type, value: regExpExecArray
        }
    }
    return {
        type: 6, value: {groups: {body: tokenizer}}
    }
}


class Parser {
    /**
     * @type {string}
     */
    template;
    /**
     * @type number
     */
    cursor;

    constructor(template) {
        this.template = template;
        this.cursor = 0;
    }

    get value() {
        return this.template.slice(this.cursor);
    }

    attributeLiteral() {
        const props = [];
        let condition = undefined;
        let For = undefined;
        let v_key = undefined;
        let t = tokenizer.startTagOpen;
        P: while (!this.EOF()) {
            const {type, value: val} = advanceBy([tokenizer.attributes,
                                                  tokenizer.startTagEnd,
                                                  tokenizer.startLineTagEnd],
                                                 this.value);
            const {groups: {body}} = val;
            switch (type) {
                case tokenizer.attributes:
                    const [, , key] = val;
                    const value = val[4] ?? val[5] ?? val[6]
                    this.eat(body.length);
                    const {groups: {key: dynamicKey = false}} = dynamicAttr.exec(key) ?? {groups: {key: false}};
                    if (dynamicKey) {
                        switch (dynamicKey) {
                            case "class":
                            case "style":
                            case "click":
                            case "ref":
                                props.push([dynamicKey,
                                            value,
                                            1]);
                                break;
                            case "if":
                            case "else-if":
                            case "else":
                                condition = [key,
                                             value];
                                break;
                            case "for":
                                For = value;
                                break;
                            case "key":
                                v_key = value;
                                break;
                            default:
                        }
                    } else {
                        props.push([key,
                                    value,
                                    0]);
                    }
                    break;
                case tokenizer.startTagEnd:
                    this.eat(body.length);
                    break P;
                case tokenizer.startLineTagEnd:
                    t = tokenizer.startLineTagEnd;
                default:
                    throw new DOMException(`parse error`)
            }
        }

        return {props, condition, key: v_key, For, type: t}
    }

    ElementLiteral(tag) {
        if (!tag) {
            const {type, value: {groups: body}} = advanceBy([tokenizer.startTagOpen],
                                                            this.value);
            if (type !== tokenizer.startTagOpen) {
                warn(`not of type Element：${this.value}`);
                throw new DOMException(`not of type Element：${this.value}`);
            }
            this.eat(body.length);
            tag = body;
        }
        const tagName = tag.slice(1);
        const {props, key, condition, For, type: t} = this.attributeLiteral();
        if (t === tokenizer.startLineTagEnd) {
            return {
                type : "ELEMENT",
                value: {
                    tagName,
                    condition,
                    For,
                    key,
                    props,
                    children: []
                }
            }
        }
        const children = this.childLiteral();

        const {type, value: {groups: {body}}} = advanceBy([tokenizer.EOF],
                                                          this.value);
        if (type !== tokenizer.EOF) {
            warn(`Template compilation error: Tags with side effect`);
            throw new DOMException(`Template compilation error: Tags with side effect`);
        } else {
            this.eat(body.length);
        }
        return {
            type : "ELEMENT",
            value: {
                tagName,
                condition,
                For,
                key,
                props,
                children
            }
        }


    }

    TextNodeLiteral(body) {
        return {
            type: "TEXT-NODE", value: body
        }
    }

    EOF() {
        return this.cursor >= this.template.length
    }

    eat(len) {
        if (len === 0) {
            warn(`no characters matched:${this.template.slice(this.cursor)}`)
            throw new DOMException(`no characters matched:${this.template.slice(this.cursor)}`);
        }
        this.cursor += len;
    }

    CommentLiteral({body, data}) {
        this.eat(body.length);
        return {
            type : "COMMENT",
            value: data
        }
    }

    childLiteral() {
        const result = [];
        P: while (!this.EOF()) {
            const {type, value: {groups}} = advanceBy([tokenizer.startTagOpen,
                                                       tokenizer.EOF,
                                                       tokenizer.textNode],
                                                      this.value);
            const {body} = groups
            switch (type) {
                case tokenizer.textNode:
                    this.eat(body.length);
                    result.push(this.TextNodeLiteral(body));
                    break;
                case tokenizer.startTagOpen:
                    this.eat(body.length);
                    result.push(this.ElementLiteral(body));
                    break;
                case tokenizer.EOF:
                    break P;
                case tokenizer.comment:
                    result.push(this.CommentLiteral(groups));
                    break
            }
        }
        return result;
    }
}

const parser = new Parser(template);
//export {Parser}
console.log(parser.childLiteral())
