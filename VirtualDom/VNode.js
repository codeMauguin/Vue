import { Node, updateProps } from "./index.js";
import { diffProps, isNull } from "../util/index.js";
import { ViewRender } from "../Mustache/index.js";

export default class VNode extends Node {
    tagName;
    /**
     * @type {Object}
     * @field attrs
     * @field dynamicAttrs
     */
    #props = null;
    oldProps = {};
    hookNode = null;
    hookShow = null;
    parentDom = null;

    isShow = true;
    isMount = true;
    diff = { same: Boolean, deleteProps: {}, updateProps: {} };

    constructor(tagName, props, children) {
        super();
        this.tagName = tagName;
        this.props = props;
        this.children = children;
    }

    get props() {
        return this.#props;
    }

    /**
     * @param {any} value
     */
    set props(value) {
        this.#props = value;
    }

    static of() {
        return new VNode();
    }

    mountEven(context) {
        const keys = Object.keys(this.#props.dynamicEven);
        if (keys.length > 0) {
            for (const key of keys) {
                switch (true) {
                    case /click/gi.test(key):
                        {
                            const _key = key.slice(1, key.length);
                            const even = ViewRender(
                                {
                                    ...context,
                                    ...context._methods,
                                    ...context._data,
                                },
                                this.#props.dynamicEven[key],
                            );
                            this.elm.addEventListener(_key, even.bind(context));
                        }
                        break;
                    case /value/gi.test(key):
                        {
                            //TODO value 发生变化，修改属性
                        }
                        break;
                    default: {
                        console.warn("props is not support!");
                    }
                }
            }
        }
    }

    getProps(context) {
        return {
            ...this.compile(this.#props.dynamicAttrs, context),
        };
    }
    updateData(context) {
        const props = this.getProps(context);
        this.diff = diffProps(this.oldProps, props);
        this.oldProps = props;
        if (this.hookNode) {
            this.isShow = ViewRender(context._data, this.hookShow);
        }
    }

    mountStaticProps() {
        if (this.isStatic) return;
        const diff = diffProps({}, this.#props.attrs);
        updateProps(this.elm, diff);
    }

    mountProps(context) {
        if (!this.diff.same) {
            updateProps(this.elm, this.diff);
        }
    }

    loadStatic() {
        this.isStatic =
            Object.keys(this.#props.dynamicAttrs).length === 0 &&
            isNull(this.#props.type);
    }

    update(context) {
        if (this.isStatic) return;
        this.mountProps(context);
        if (this.parentDom === null && this.elm !== undefined) {
            this.parentDom = this.elm.parentElement;
        }
        if (!this.isShow) {
            if (this.isMount) {
                if (this.hookNode instanceof Node) {
                    this.hookNode.updateData(context);
                    this.hookNode.mountProps(context);
                    const newDom = this.elm.cloneNode(true);
                    this.parentDom.replaceChild(this.hookNode.elm, this.elm);
                    this.elm = newDom;
                } else {
                    const newDom = this.elm.cloneNode(true);
                    this.parentDom.replaceChild(this.hookNode, this.elm);
                    this.elm = newDom;
                }
                this.isMount = false;
            }
        } else {
            if (!this.isMount) {
                if (this.hookNode instanceof Node) {
                    const newDom = this.hookNode.elm.cloneNode(true);
                    this.parentDom.replaceChild(this.elm, this.hookNode.elm);
                    this.hookNode.elm = newDom;
                    this.isMount = true;
                } else {
                    const newDom = this.hookNode.cloneNode(true);
                    this.parentDom.replaceChild(this.elm, this.hookNode);
                    this.hookNode = newDom;
                    this.isMount = true;
                }
            }
        }
    }

    compile(props, context) {
        const keys = Object.keys(props);
        return keys.reduce((pre, current) => {
            Reflect.set(
                pre,
                current,
                ViewRender(
                    { ...context, ...context._data, ...context._methods },
                    props[current],
                ),
            );
            return pre;
        }, {});
    }

    toString() {
        return "VNode";
    }

    of() {
        return VNode.of();
    }
}
