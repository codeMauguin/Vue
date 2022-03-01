/**
 * @author 陈浩
 * @date 2022-01-22 21:55:18
 * @slogan: Talk is cheap. Show me the code.
 * @Last Modified by: 陈浩
 * @Last Modified time: 2022-01-27 08:17:59
 */
import { isFunction, isNotString, isNull, timer } from "../util/index.js";
import { createProxy, deepReadOnly, readonly, toRef } from "../proxy/index.js";
import { dept, watcher } from "../watcher/index.js";
import {
  compile,
  ENode,
  h,
  patchNode as patch,
  TNode,
} from "../VirtualDom2/index.js";

const emptyObject = Object.freeze({});

/**
 * @param {Vue} properties
 */
function mount(properties) {
  // @ts-ignore
  properties.reactive = function (/** @type {any} */ target) {
    return createProxy(target);
  };
  // @ts-ignore
  properties.toRef = function (/** @type {any} */ target) {
    return toRef(target);
  };
  // @ts-ignore
  properties.readonly = readonly;
  properties.watcher = watcher;
  // @ts-ignore
  properties.deepReadOnly = deepReadOnly;
  /**
   * 初始化Options属性
   * @param {Object} Options
   */
  // @ts-ignore
  properties.initialization = function (Options) {
    const keys = Object.keys(Options);
    for (const key of keys) {
      switch (key) {
        case "data":
          {
            if (isFunction(Options[key])) {
              this._data = Options[key].call(window, this);
            } else {
              console.warn("data is preferably a function");
              this._data = Options[key];
            }
          }
          break;
        case "create":
          {
            if (isFunction(Options[key])) this._create = Options[key];
            else console.warn("create is not a Function");
          }
          break;
        case "methods":
          {
            this._methods = Options[key];
          }
          break;
        case "mounted":
          {
            if (isFunction(Options[key])) this._mounted = Options[key];
            else console.warn("mounted is not a Function");
          }
          break;
      }
    }
  };
  /**
   * 挂载节点
   * @param {string} el 节点信息
   * @param context
   */
  // @ts-ignore
  properties.mount = function (el, /**@type{ProxyHandler<Vue>}*/ context) {
    if (isNotString(el)) {
      console.warn("el is not specification");
    }
    const dom = document.querySelector(el);
    if (dom === null) {
      console.warn("no node");
      return;
    }
    // console.log(dom.outerHTML)
    // htmlReader(dom.outerHTML)
    this[AST] = new Function(
      "target",
      `with(target){return ${h(dom.tagName, dom.attributes, dom.childNodes)}}`,
    );
    this.virtualDom = this[AST](context);
    compile(this.virtualDom, context);
    dom.parentElement?.replaceChild(this.virtualDom.init(), dom);
  };
  /**
   * 收集更新信息，进行更新
   */
  // @ts-ignore
  properties.useTask = false;
  // @ts-ignore
  properties.task = [];
  // @ts-ignore
  properties.update = function () {
    // @ts-ignore
    this.task.push(this);
    if (this.useTask === false) {
      //@ts-ignore
      this.useTask = true;
      Promise.resolve().then(
        timer.bind(null, callback.bind(this), "View update time"),
      );
    }
  };

  function callback() {
    // @ts-ignore
    this.task.length = 0;
    // @ts-ignore
    const oldNode = this.virtualDom;
    // @ts-ignore
    this.virtualDom = this[AST](this);
    // @ts-ignore
    compile(this.virtualDom, this);
    // @ts-ignore
    patch(oldNode, this.virtualDom);
    // @ts-ignore
    if (this.task.length > 0) {
      callback.apply(this);
    } else {
      this.useTask = false;
    }
  }

  // @ts-ignore
  properties._c = function (
    /** @type {string} */ sel,
    /** @type {any} */ attributes,
    /** @type {import("../VirtualDom2/Node.js").default[]} */ children,
  ) {
    return new ENode(sel, attributes, children);
  };
  // @ts-ignore
  properties._t = function (/** @type {any} */ text) {
    return new TNode(text);
  };
}

/**
 * create:视图未更新时调用
 * mounted:视图已经加载完毕使用，建议初始化数据在create中使用
 */
const AST = Symbol("AST");

class Vue {
  static dept = dept;
  static id = 0;
  /**
   *@type{Function}
   */
  [AST];
  _data = emptyObject;
  _methods = emptyObject;
  _create = undefined;
  _mounted = undefined;
  uid;

  /**
   * @param {{ el: any; }} options
   */
  constructor(options) {
    this.uid = Vue.id++;
    //读取属性
    // @ts-ignore
    this.initialization(options);
    if (isNull(options.el)) {
      console.error(`没有节点信息`);
      // @ts-ignore
      return undefined;
    }
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
    // @ts-ignore
    this._create?.call(context);
    //挂载虚拟dom
    // @ts-ignore
    timer(this.mount.bind(this, options.el, context), "View mount time");
    // create中更新数据，不刷新视图，mounted中数据会刷新视图
    // mounted中是视图挂载
    Vue.dept.$emit(context);
    // @ts-ignore
    this._mounted?.call(context);
    return context;
  }
}

mount(Vue.prototype);
export default Vue;
