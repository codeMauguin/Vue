/**
 * @author 陈浩
 * @date 2022-01-16 20:22:42
 * @slogan: Talk is cheap. Show me the code.
 * @Last Modified by: 陈浩
 * @Last Modified time: 2022-01-29 07:04:52
 */
import {propsMustache as h} from "../Mustache/index.js";
import {clone as deepClone, isNotNull, isNull} from "../util/index.js";
import {dispatchEvent, Node, setAttribute} from "./index.js";

export default class ENode extends Node {
    /**
     * @type {HTMLElement}
     */
    elm;
    /**
     * @type {number | undefined}
     */
    key;
    /**
     * @type {string}
     */
    sel;
    attributes = {};
    props = {
        attributes: {},
        method: {},
    };
    $props = {
        attributes: {},
        method: {},
    };
    children;

    /**
     * @param {String} sel
     * @param {{ [s: string]: Attr; } | ArrayLike<Attr>|Object} attributes
     * @param {Array<Node>} children
     */
    constructor(sel, attributes, children) {
        super();
        this.sel = sel;
        this.setAttributes = attributes;
        this.children = children;
        this.children.forEach((e) => (e.parent = this));
    }

    get prop() {
        return this.$props;
    }

    // @ts-ignore
    /**
     * @param {{ [s: string]: Attr; } | ArrayLike<Attr>} attr
     */
    set setAttributes(attr) {
        for (const [name, value] of Object.entries(attr)) {
            switch (true) {
                case /v-bind:/gi.test(name): {
                    Reflect.set(
                        this.$props.attributes,
                        name.slice(7),
                        // @ts-ignore
                        value.trim(),
                        this.$props.attributes,
                    );
                }
                    break;
                case /@click/gi.test(name): {
                    Reflect.set(
                        this.$props.method,
                        "click",
                        // @ts-ignore
                        value.trim(),
                        this.$props.method,
                    );
                }
                    break;
                case /@for/gi.test(name): {
                    // @ts-ignore
                    this.dynamicTemplate = value;
                }
                    break;
                case /@if|@else|@show|:key|@else-if|@/gi.test(name):
                    // @ts-ignore
                    this.$props.attributes[name.slice(1)] = value.trim();
                    break;
                default:
                    // @ts-ignore
                    Reflect.set(this.attributes, name, value.trim(), this.attributes);
            }
        }
    }

    /**
     * @param {object} context
     */
    render(context) {
        for (const [key, value] of Object.entries(this.$props.attributes)) {
            switch (key) {
                case "show": {
                    const isShow = h(value, context._data);
                    if (isShow === false || isShow === "0") {
                        /**
                         * 含有某些属性，开启缓存,且用户本身含有属性
                         */
                        if (isNotNull(this.attributes["display"])) {
                            //Todo 没有缓冲，开启缓存,后面如果需要，则需要具体判断key缓存是否存在
                            if (isNull(this.$props.cache)) {
                                this.$props.cache = {
                                    show: this.attributes["display"],
                                };
                            } else if (isNull(this.$props.cache["show"]))
                                this.$props.cache["show"] = this.attributes["display"];
                        }
                        this.props.attributes["display"] = "none";
                    } else {
                        if (isNull(this.$props.cache) || isNull(this.$props.cache.show)) {
                            this.props.attributes["display"] = "block";
                        } else {
                            this.props.attributes["display"] = this.$props.cache.show;
                        }
                    }
                    break;
                }
                case "key":
                    break;
                default: {
                    this.props.attributes[key] = h(value,
                        context._data
                    );
                }
            }
        }
        for (const [key, value] of Object.entries(this.$props.method)) {
            if (isNotNull(this.props.method[key])) {
                continue;
            }
            const methodRegExp =
                /(?<name>\w+)?([(,])(?<arg>.*?)(?=[,)])/g;
            let result = methodRegExp.exec(value);
            let name, args = [];
            do {
                // @ts-ignore
                const {groups: {name: N, arg} = {name: undefined}} = result;
                if (N) {
                    name = N;
                }
                if (arg && arg !== '') {
                    args.push(arg);
                }
            } while ((result = methodRegExp.exec(value)) !== null);
            const fun = h(
                name,
                {
                    ...context
                    , ...context._methods
                }
            );
            this.props.method[key] = () => {
                const _args = [];
                Array.from(args).forEach((arg) => {
                    _args.push(
                        h(
                            arg, {
                                ...context,
                                ...context._data,
                            }
                        ),
                    );
                });
                fun.apply(context, _args);
            };
        }
        // @ts-ignore
    }

    init() {
        let dom = document.createElement(this.sel);
        for (const [key, value] of Object.entries(Object.assign(this.attributes, this.props.attributes))) {
            setAttribute(dom, key, value);
        }
        for (const [/**@type{HTMLElementEventMap}*/key, value] of Object.entries(this.props.method)) {
            dispatchEvent(dom, key, value);
        }
        // @ts-ignore
        const fam = document.createDocumentFragment();
        this.children.forEach(child => fam.appendChild(child.init()));
        dom.appendChild(fam);
        this.elm = dom;
        return dom;
    }

    /**
     *
     * @param {ENode|TNode} other
     * @returns {boolean}
     */
    equal(other) {
        // @ts-ignore
        return (
            // @ts-ignore
            this.key === other.key && this.isInstance(other) && other.sel === this.sel
        );
    }

    clone() {
        const cloneChild = [];
        this.children.forEach((e) => {
            cloneChild.push(e.clone());
        });
        const clone = Object.create({
            __proto__: ENode.prototype,
            sel: this.sel,
            children: cloneChild,
            $props: this.$props,
            props: deepClone(this.props),
            attributes: this.attributes,
            isStatic: this.static,
            key: this.key,
            dynamicTemplate: this.dynamicTemplate
        });
        clone.children.forEach((/** @type {{ parent: ENode; }} */ child) => child.parent = clone);
        return clone;
    }
}
