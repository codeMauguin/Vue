import {Parser} from "../htmlParse/Parser.js";
import {warn} from "../log";
import {reactive, toRef} from "../proxy";
import {isNull, timer} from "../util";
import {_c_, _t_, _v_, compileChild, diff, h, render} from "../VirtualDom3";
import {dept, watcher} from "../watcher";

let VUE_UID = 0;
const emptyFunction = () => ({});
const emptyObject = Object.freeze({});
const NOOP = () => {
};

/**
 * @param setupState
 * @param {object} context
 */
function exposeSetupStateOnRenderContext(setupState,
                                         context) {
    for (let key of Reflect.ownKeys(setupState)) {
        Reflect.defineProperty(context,
                               key,
                               {
                                   enumerable: false, configurable: false,
                                   get                            : () => setupState[key], set: NOOP,
                               });
    }
}

/**
 * @param {any[]} AST
 */
function exposeOnRenderNode(AST) {
    return () => AST.map((/** @type {{ type: any; value: any; }} */
                          child) => new Function(`with(this){return ${h(child)}}`).call({
                                                                                            _v_,
                                                                                            _t_,
                                                                                            _c_,
                                                                                        }),);
}

const initState = Object.assign;

function mount(properties,
               children) {

    properties.append(...children);
    return properties;
}

class Vue {
    static reactive = reactive;
    static ref = toRef;
    static watch = watcher;
    isVue = true;
    V_ID = VUE_UID++;
    #component = {};
    isMound = false;

    /**
     * @param {{}} config
     */
    constructor(config) {
        this.#component = config;
    }

    static createApp(config) {
        return new Vue(config)
    }

    $emit([message, payload]) {
        switch (message) {
            case "ref": {
                Reflect.set(this,
                            `$${payload.key}`,
                            payload.elm,
                            this);
            }
                break;
        }
    }

    /**
     * @param {any} containerOrSelector
     */
    mount(containerOrSelector) {
        const container = normalizeContainer(containerOrSelector);
        if (!container) return;
        const {
            template = container.innerHTML, setup = emptyFunction, data = emptyFunction,
            methods = emptyObject, created = emptyFunction, mounted = emptyFunction,
        } = this.#component;
        container.innerHTML = ``;
        const vm = {};
        initState(vm,
                  methods);
        initState(vm,
                  setup(this));
        initState(vm,
                  data?.() ?? data)
        exposeSetupStateOnRenderContext(vm,
                                        this,);
        created.call(vm);
        const parser = new Parser();
        parser.init(template);
        const AST = parser.ChildrenLiteral();
        const h = exposeOnRenderNode(AST);
        let environment = h();
        compileChild(environment,
                     [this]);
        /**
         *
         * @type {Node[]}
         */
        const c = environment.map(render);
        const context = this;
        dept.$emit(context,
                   {
                       key: "isMound", monitor: false,
                       even                   : (/** @type {{ monitor: boolean; even: (arg0: any) => void; }} */
                                                 e,) => {
                           if (context.isMound === false) {
                               context.isMound = true;
                               Promise.resolve(timer.bind(null,
                                                          (/** @type {any[]} */
                                                           updateEnvironment) => {
                                                              compileChild(updateEnvironment,
                                                                           [context]);
                                                              diff(container,
                                                                   environment,
                                                                   updateEnvironment);
                                                              environment = updateEnvironment;
                                                              if (e.monitor) {
                                                                  e.even(e);
                                                                  e.monitor = false;
                                                              }
                                                              context.isMound = false;
                                                          },
                                                          "View update time",),)
                                      .then((fn) => fn(h()));
                           }
                       }, wait() {
                           this.monitor = true;
                       },
                   });
        container.appendChild(mount(document.createDocumentFragment(),
                                    c));
        mounted.call(context);
        return this;
    }
}

Reflect.defineProperty(Vue,
                       "prototype",
                       {
                           enumerable: false, configurable: false, writable: false,
                       });

/**
 * @param {any} container
 */
function normalizeContainer(container) {
    let res = document.querySelector(container);
    if (isNull(res)) {
        warn(`Failed to mount app: mount target selector "${container}" returned null.`,);
    }
    return res;
}

export {Vue};
