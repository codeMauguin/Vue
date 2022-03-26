import {Parser} from "../htmlParse/Parser.js";
import {warn} from "../log";
import {reactive, toRef} from "../proxy";
import {isNull, timer} from "../util";
import {_c_, _t_, _v_, compileChild, diff, h, render} from "../VirtualDom3";
import {dept, watcher} from "../watcher";

let VUE_UID = 0;
const emptyFunction = () => ({})
const emptyObject = Object.freeze({});
const NOOP = () => {
}

function exposeSetupStateOnRenderContext(data,
                                         context) {
    const setupState = new Proxy(emptyObject,
                                 {
                                     get(target,
                                         p) {
                                         for (const d of data) {
                                             if (Reflect.has(d,
                                                             p)) return Reflect.get(d,
                                                                                    p);

                                         }
                                         return undefined;
                                     }
                                 });
    for (const d of data) for (let key of Reflect.ownKeys(d)) {
        Reflect.defineProperty(context,
                               key,
                               {
                                   enumerable: true, configurable: true, get: () => setupState[key],
                                   set: NOOP
                               })
    }
}

function exposeOnRenderNode(AST) {
    return () => new Function(`with(this){return ${h(AST)}}`).call({_v_, _t_, _c_});
}

class Vue {
    static reactive = reactive;
    static ref = toRef;
    static watch = watcher
    isVue = true;
    V_ID = VUE_UID++;
    #component = {};
    isMound = false;

    constructor(config) {
        this.#component = config;
    }

    $emit([message, payload]) {
        switch (message) {
            case 'ref': {
                Reflect.set(this,
                            `$${payload.key}`,
                            payload.elm,
                            this);
            }
                break;
        }
    }

    mount(containerOrSelector) {
        const container = normalizeContainer(containerOrSelector);
        if (!container) return;
        const template = `<div>${container.innerHTML}</div>`;
        container.innerHTML = ``;
        const {
            setup = emptyFunction, data = emptyFunction, methods = emptyObject,
            created = emptyFunction, mounted = emptyFunction
        } = this.#component;
        exposeSetupStateOnRenderContext([data(),
                                            setup({}),
                                            methods],
                                        this);
        created.call(this);
        const parser = new Parser();
        const AST = parser.parser(template);
        const h = exposeOnRenderNode(AST);
        let environment = h();
        compileChild(environment.children,
                     environment,
                     [this]);
        render(environment);
        const context = this;
        mounted.call(this);
        container.append(...environment.elm.childNodes);
        dept.$emit(context,
                   {
                       key: "isMound",
                       monitor: null,
                       even: (e) => {
                           if (context.isMound === false) {
                               context.isMound = true;
                               Promise.resolve(timer.bind(null,
                                                          (updateEnvironment) => {
                                                              compileChild(updateEnvironment.children,
                                                                           updateEnvironment,
                                                                           [context]);
                                                              diff(container,
                                                                   environment.children,
                                                                   updateEnvironment.children);
                                                              environment = updateEnvironment;
                                                              if (e.monitor) {
                                                                  e.even(e);
                                                                  e.monitor = false;
                                                              }
                                                              context.isMound = false;
                                                          },
                                                          "View update time"))
                                      .then(fn => fn(h()));
                           }
                       },
                       wait() {
                           this.monitor = true;
                       }
                   })
        return this;
    }
}

Reflect.defineProperty(Vue,
                       "prototype",
                       {
                           enumerable: false, configurable: false, writable: false
                       })

function normalizeContainer(container) {
    let res = document.querySelector(container);
    if (isNull(res)) {
        warn(`Failed to mount app: mount target selector "${container}" returned null.`)
    }
    return res;
}

export {Vue};
