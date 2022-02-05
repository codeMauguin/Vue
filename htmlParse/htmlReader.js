const elementFrameWork = {
    tag: String,
    type: Number,
    normalProps: /**@type {Array<string>}*/ Array,
    dynamicProps: Array,
    children: Array
}
const Token = {
    pos: 0,
    buffer: String || Array,
    limit: Number,
    peek: String || Number,
    next: String
}
/**
 *
 * @param {string} buffer
 * @returns
 */
const createToken = buffer => Object.create(Token, {
    buffer: {
        value: buffer,
        enumerable: false,
        writable: false,
        configurable: false
    },
    next: {
        value: function () {
            return this.pos === this.limit ? -1 : this.buffer[this.pos++];
        },
        writable: false,
        enumerable: false,
        configurable: false
    },
    limit: {
        writable: false,
        enumerable: false,
        configurable: false,
        value: buffer.length
    },
    pos: {
        value: 0,
        writable: true,
        enumerable: false,
        configurable: false
    },
    peek: {
        value: function () {
            return this.pos === this.limit ? -1 : this.buffer[this.pos];
        },
        writable: false,
        enumerable: false,
        configurable: false
    },
    nextPeek: {
        writable: false,
        enumerable: false,
        configurable: false,
        value: function () {
            return (this.pos + 1) === this.limit ? -1 : this.buffer[this.pos + 1];
        }
    }
});

const StringBuilder = {
    content: new Array(0),
    get length() {
        return this.content.length
    },
    /**
     * @param {string} c
     */
    append(c) {
        this.content.push(c);
    },
    eliminate() {
        this.content.length = 0;
    },
    toString() {
        return this.content.join(``);
    }
}

/**
 * @param {string} template
 */
function $compile(template) {
    let token;
    if (typeof template === "string")
        token = createToken(template);
    else
        token = template;
    ;
    const stringboard = Object.create(StringBuilder);
    let tag, normalProps = [],
        dynamicProps = [],
        children = [];
    let mode = -1;
    if (mode === -1) {
        let level = readTagName(token, stringboard);
        if (level === undefined || level === -1) return;
        tag = stringboard.toString();
        stringboard.eliminate();
        if (level === 0) {
            stringboard.eliminate();
            if (readProps(token, stringboard, normalProps, dynamicProps) === 1) {
                return Object.create({
                    __proto__: elementFrameWork,
                    tag: stringboard.toString(),
                    normalProps: normalProps,
                    dynamicProps: dynamicProps,
                    children: null
                });
            } else {
                mode++
            }
        } else if (level === 1) {
            //将/> 挤出栈
            token.next();
            token.next();
            return Object.create({
                __proto__: elementFrameWork,
                tag: tag,
                normalProps: null,
                dynamicProps: null,
                children: null
            });
        } else {
            mode++;
        }
    }
    if (mode === 0) {
        readContent(token, children, stringboard);
        mode++;
    }
    //消耗 </
    token.next();
    token.next();
    for (let i = 0; i < tag.length; i++) {
        token.next();
    }
    if (token.next() !== ">")
        console.warn("Incorrect element closure label");
    return Object.create({
        __proto__: elementFrameWork,
        tag: tag,
        normalProps: normalProps,
        dynamicProps: dynamicProps,
        children: children
    });
};

/**
 * @param {string} warnText
 */
function warn(warnText) {
    console.warn(warnText);
}

/**
 * @param {Token} token
 * @param {StringBuilder} stringboard
 */
function readTagName(token, stringboard) {
    let read;
    if ((read = token.next()) === "<") {
        // <div>
        //<!--
        //<br/>
        for (; ;) {
            read = token.peek();
            //@ts-ignore
            if (read === -1) {
                warn(`Wrong end`);
                return -1;
            } else if (read === " ") {
                return 0;
            } else if (read === "/") {
                return 1;
            } else if (read === ">") {
                token.next();
                return 2;
            } else {
                stringboard.append(read);
                token.next();
            }
        }
    } else {
        warn(`Element starts with the wrong word ${read}`);
    }
}

/**
 *
 * @param {*} token
 * @param {StringBuilder} stringboard
 * @param {*} normalProps
 * @param {*} dynamicProps
 * @returns
 */
function readProps(token, stringboard, normalProps, dynamicProps) {
    token.next();
    let next = token.peek();
    while (next !== -1) {
        if (next === ">") {
            token.next();
            return 0;
        }
        if (
            next === " "
        ) {
            token.next();
            next = token.peek();
            continue;
        }
        if (next === "/") {
            next = token.next();
            if (next.next() !== ">") {
                console.warn("Illegal character" + "/");
            } else {
                return 1;
            }
        }

        function readKey() {
            stringboard.append(next);
            token.next();
            next = token.peek();
            while (next !== "=") {
                stringboard.append(next);
                token.next();
                next = token.peek();
            }
            return stringboard.toString();
        }

        function readValue() {
            next = token.peek();
            while (next !== " " && next !== ">" && next !== "/") {
                stringboard.append(next);
                token.next();
                next = token.peek();
            }
            return stringboard.toString();
        }

        let key = readKey();
        token.next();
        stringboard.eliminate();
        let value = readValue();
        stringboard.eliminate();
        if (/:|@/.test(key)) {
            dynamicProps.push({
                name: key,
                value
            });
        } else {
            normalProps.push({
                name: key,
                value
            })
        }
        if (next === "/") {
            next = token.next();
            if (next.next() !== ">") {
                console.warn("Illegal character" + "/");
            } else {
                return 1;
            }
        }
    }
    console.warn("Element missing");
}

/**
 *
 * @param {*} token
 * @param {Array<any>} children
 * @param {StringBuilder}
    stringboard
 */
function readContent(token, children, stringboard) {
    let next = token.peek();
    while (next !== "<") {
        stringboard.append(next);
        token.next();
        next = token.peek();
    }
    if (stringboard.length > 0)
        children.push(stringboard.toString());
    stringboard.eliminate();
    //判断是子元素还是闭合标签
    if (token.nextPeek() === "/") {
        return;
    }
    children.push($compile(token));
    readContent(token, children, stringboard);
}

const a = $compile(`<div id="app">
        <div @click="sliderLeft" class="slider-left" :class="left"><span>&lt;</span></div>
        <div class="container" :style="containerStyle">
            <div class="data-container" :style="dataStyle">
                <div class="slider-active" :style="sliderActive">
                </div>
                <div class="slider block" :ref="(el)=>item.el=el" v-for="(item, index) in pages" key="item.index"
                    @click="Page(item)">
                    <span>{{item.index}}</span>
                </div>
            </div>
        </div>
        <div :class="right" @click="sliderRight" class="slider-right"><span>&gt;</span></div>
    </div>`);
console.log(JSON.stringify(a));
