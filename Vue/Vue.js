import { isFunction, isNotString, isNull } from "../util/index.js";
import { createProxy } from "../proxy/index.js";
import { compile, loadNode } from "../VirtualDom/index.js";
import { readonly,deepReadOnly } from "../proxy/index.js";
function ƒ(virtualDom, context, name) {
    virtualDom[name](context);
    for (const children of virtualDom.children) {
        ƒ(children, context, name);
    }
}

function mountEven(virtualDom, context) {
    ƒ(virtualDom, context, "mountEven");
}

function mount(properties) {
    properties.ref = function (target) {
        return this.reactive({ value: target });
    };
    properties.reactive = function (target) {
        return createProxy(target, this);
    };
    properties.readonly = readonly;
    properties.deepReadOnly=deepReadOnly;
    /**
     * 初始化Options属性
     * @param {Object} Options
     */
    properties.initialization = function (Options) {
        this._Options = Options;
        const keys = Object.keys(Options);
        for (const key of keys) {
            switch (key) {
                case "data":
                    {
                        if (isFunction(Options[key])) {
                            this._data = Options[key].call(this, this);
                        } else {
                            console.warn("data is preferably a function");
                            this._data = Options[key];
                        }
                    }
                    break;
                case "create":
                    {
                        if (isFunction(Options[key]))
                            this._create = Options[key];
                    }
                    break;
                case "methods":
                    {
                        this._methods = Options[key];
                    }
                    break;
                case "mounted":
                    {
                        if (isFunction(Options[key]))
                            this._mounted = Options[key];
                    }
                    break;
            }
        }
    };
    /**
     * 挂载节点
     * @param {string} el 节点信息
     */
    properties.mount = function (el, context) {
        if (isNotString(el)) {
            console.warn("el is not specification");
        }
        const dom = document.querySelector(el);
        const virtualDom = compile(dom);
        ƒ(virtualDom, context, "updateData");
        this.virtualDom = virtualDom;
        const newDom = loadNode(virtualDom);
        ƒ(virtualDom, context, "update");
        mountEven(virtualDom, context);
        dom.parentElement.replaceChild(newDom, dom);
        context.whether = true;
    };
    /**
     * 收集更新信息，进行更新
     */
    properties.update = function () {
        if (!this.whether) return;
        ƒ(this.virtualDom, this, "updateData");
        ƒ(this.virtualDom, this, "update");
    };
}

/**
 * create:视图未更新时调用
 * mounted:视图已经加载完毕使用，建议初始化数据在create中使用
 */
class Vue {
    _data = {};
    _methods = {};
    _create = null;
    _mounted = null;
    whether = false;

    constructor(options) {
        //读取属性
        this.initialization(options);
        const context = new Proxy(this, {
            get(target, key, receiver) {
                return (
                    Reflect.get(target, key, receiver) ??
                    Reflect.get(target._data, key, target._data) ??
                    Reflect.get(target._methods, key, target._methods)
                );
            },
            set(target, key, value, receiver) {
                if (Reflect.has(target, key)) {
                    return Reflect.set(target, key, value, receiver);
                } else if (Reflect.has(target._data, key)) {
                    return Reflect.set(target._data, key, value, target._data);
                } else {
                    return true;
                }
            },
        });
        this._create?.call(context);
        if (isNull(options.el)) {
            console.error(`没有节点信息`);
            return undefined;
        }
        //挂载虚拟dom
        this.mount(options.el, context);
        this._mounted?.call(context);
        return context;
    }
}
mount(Vue.prototype);
export default Vue;
