import {warn} from "../log";
import {isNull, timer} from "../util";
import {Parser} from "../htmlParse/Parser.js";
import {_c_, _t_, _v_, compile, diff, h, render} from "../VirtualDom3";
import {dept} from "../watcher";

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
                Reflect.defineProperty(this,
                                       `$${payload.key}`,
                                       {
                                           value: payload.elm
                                       });
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
        compile(environment,
                this);
        render(environment);
        const context = this;
        mounted.call(this);
        container.append(...environment.elm.childNodes);
        dept.$emit(context,
                   {
                       key: "isMound", even: () => {
                           if (context.isMound === false) {
                               context.isMound = true;
                               Promise.resolve(timer.bind(null,
                                                          () => {
                                                              const updateEnvironment = h();
                                                              compile(updateEnvironment,
                                                                      context);
                                                              diff(container,
                                                                   environment.children,
                                                                   updateEnvironment.children);
                                                              environment = updateEnvironment;
                                                              context.isMound = false;
                                                          },
                                                          "View update time"))
                                      .then(fn => fn());
                           }


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
