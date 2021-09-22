import { isFunction, isString, isNotNull } from "../util/index.js";
/**
 * 请求当调用 then 才会发出请求
 * @Api get request head put delete
 */
/**
 *
 * @param {Function} then 回调函数
 * @see map 勾子函数处理回调参数；
 * @return Task()
 */
const Task = then => ({
    then,
    map: (mapResolve = DEFAULT_RESOLVE, mapReject = DEFAULT_REJECT) =>
        Task((resolve = DEFAULT_RESOLVE, reject = DEFAULT_REJECT) =>
            then(
                success => resolve(mapResolve(success)),
                error => reject(mapReject(error)),
            ),
        ),
    flatMap: fn => Task(resolve => then((...args) => resolve(fn(...args)))),
});

/**
 * 默认将reject信息返回出去，解决没有处理异常报错，建议在对异常统一管理
 * @returns Error
 * @param err
 */
const DEFAULT_REJECT = err => Promise.reject(err),
    DEFAULT_RESOLVE = suc => Promise.resolve(suc),
    DEFAULT_REQUESTING = {
        method: "GET",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8;",
        },
        body: null,
        mode: "cors",
        credentials: "include",
        cache: "default",
        redirect: "follow",
        referrer: "about:client",
        integrity: "",
        signal: null,
    };
//兼容某些浏览器不支持#私有属性
const baseURL = Symbol("baseURL");
const timeout = Symbol("timeout");
const map = Symbol("map");
const beforeMap = Symbol("beforeMap");
/**
 * 默认分组下标
 * @type {Symbol}
 */
const defaultIndex = Symbol("index");

class Processor {
    [baseURL] = [""];
    [timeout] = 3000;
    [defaultIndex] = 0;
    /**
     * @param ${ Array<Function> }
     */
    [beforeMap] = [];

    [map] = [];

    constructor(config) {
        if (isNotNull(config))
            if (isString(config)) {
                this.defaultGroup = config;
            } else {
                config.timeout ? (this.timeout = config.timeout) : void 0;
                config.baseURL ? (this.defaultGroup = config.baseURL) : void 0;
            }
    }

    /**
     * @param {Number} index
     */
    set defaultIndex(index) {
        this[defaultIndex] = index;
    }

    /**
     * @param {string} URL
     */
    set defaultGroup(URL) {
        if (!this[baseURL][this[defaultIndex]]) {
            this[baseURL][this[defaultIndex]] = URL;
        }
    }

    /**
     * @param {string} URL
     */
    set group(URL) {
        if (isString(URL)) {
            if (this[baseURL].findIndex(url => url === URL) === -1)
                this[baseURL].push(URL);
        }
    }

    get timeout() {
        return this[timeout];
    }

    /**
     * @param {number} time
     */
    set timeout(time) {
        this[timeout] = time;
    }

    static of(config) {
        return new Request(config);
    }

    baseURL(groupIndex) {
        return this[baseURL][groupIndex] ?? this[baseURL][this[defaultIndex]];
    }

    /**
     *
     * map
     * @param {Function}resolve
     * @param {Function}reject
     * @return {Processor}
     */
    map(resolve, reject) {
        this[map].push({
            resolve: isFunction(resolve) ? resolve : DEFAULT_RESOLVE,
            reject: isFunction(reject) ? reject : DEFAULT_REJECT,
        });
        return this;
    }

    beforeMap(fn) {
        //处理参数问题
        if (isFunction(fn)) {
            //挂载勾子函数,且
            this[beforeMap].push(fn);
        }
        //实现链式调用
        return this;
    }

    /**
     * @param {Object} config
     * @returns any
     */
    request(config) {
        //获取参数处理器；
        let before = this[beforeMap];
        config = before.reduce(
            (previousValue, currentValue) => currentValue(previousValue),
            config,
        );
        //获取子任务
        let childMap = this[map];
        return Task((resolve, reject) =>
            executor
                .call(this, config)
                .then(
                    data =>
                        childMap.reduce(
                            (previousValue, currentValue) =>
                                currentValue.resolve(previousValue),
                            data,
                        ),
                    error =>
                        Promise.reject(
                            childMap.reduce(
                                (previousValue, currentValue) =>
                                    currentValue.reject(previousValue),
                                error,
                            ),
                        ),
                )
                .then(resolve, reject),
        );
    }

    clone() {
        return Object.assign(Request.of(), this);
    }
}

export default class extends Processor {
    constructor(config) {
        super(config);
    }

    /**
     * 网络请求
     * @param {any} config
     * @returns  Task()
     */
    request(config) {
        if (typeof config === "string") {
            config = { url: config };
        }
        return super.request({
            method: "GET",
            ...config,
        });
    }

    /**
     *
     * @param {string | RequestInfo} url
     * @param requesting
     * @return  Task()
     */
    get(url, requesting) {
        return super.request({
            url,
            ...requesting,
            method: "GET",
        });
    }

    /**
     *
     * @param {string | RequestInfo} url
     * @param requesting
     * @return  Task()
     */
    post(url, requesting) {
        return super.request({
            url,
            ...requesting,
            method: "POST",
        });
    }

    /**
     *
     * @param {string | RequestInfo} url
     * @param  requesting
     * @return  Task()
     */
    put(url, requesting) {
        return super.request({
            url,
            ...requesting,
            method: "PUT",
        });
    }

    /**
     *
     * @param {string | RequestInfo} url
     * @param  requesting
     * @return  Task()
     */
    delete(url, requesting) {
        return super.request({
            url,
            ...requesting,
            method: "DELETE",
        });
    }
}

/**
 * 初始化Request参数
 * @param {Request.prototype} target
 */
function initParams(target) {
    Object.defineProperties(target, {
        DEFAULT_REJECT: {
            value: DEFAULT_REJECT,
        },
        DEFAULT_RESOLVE: {
            value: DEFAULT_RESOLVE,
        },
    });
}

initParams(Processor.prototype);

/**
 * 设置请求超时
 * @param {Number} timeout
 * @param {AbortController} controller
 * @returns Promise.reject();
 */
function requestTimeout(timeout, controller) {
    return new Promise((_resolve, reject) => {
        setTimeout(() => {
            controller.abort();
            reject({
                errorCode: 404,
                message: "请求超时",
            });
        }, timeout);
    });
}

/**
 *
 * @param  config
 * @param {AbortSignal} signal
 * @returns 包装好的参数
 */
function params(config, signal) {
    const requesting = Object.assign(Object.create(null), DEFAULT_REQUESTING);
    return {
        ...requesting,
        ...config,
        signal,
    };
}

/**
 *
 * @param {object} config
 * @return Promise<Response>
 */
function executor(config) {
    const groupIndex = config?.group ?? this[defaultIndex];
    const timeout = config.timeout ?? this.timeout;
    let url = `${this.baseURL(groupIndex)}${config.url}`;
    /**
     * 匹配请求方法对应处理，后期可以添加其他处理
     */
    switch (true) {
        case /HEAD|GET/gi.test(config.method.toUpperCase()): {
            url = config.body
                ? `${url}?${new URLSearchParams(config.body)}`
                : url;
            config.body = null;
            break;
        }
    }
    const controller = config.controller ?? new AbortController();
    const signal = controller.signal;
    /**
     * 若果触发超时计时器，则中断请求
     * 如果正常执行，计时器取消
     */
    return Promise.race([
        requestTimeout(timeout, controller),
        fetch(url, params(config, signal)).then(async config => {
            const { status, ok, headers, statusText, body } = config;
            const resultType = headers.get("content-type").split(";")[0];
            const response = {
                data: null,
                status,
                ok,
                statusText,
                config,
                headers,
                errorCode: status,
            };
            switch (true) {
                case /text\/html/gi.test(resultType): {
                    response.data = await config.text();
                    break;
                }
                case /application\/json/gi.test(resultType): {
                    response.data = await config.json();
                    break;
                }
                default: {
                    response.data = {
                        body,
                        text: () => config.text(),
                        json: () => config.json(),
                        arrayBuffer: () => config.arrayBuffer(),
                        formData: () => config.formData(),
                    };
                }
            }
            return response;
        }, DEFAULT_REJECT),
    ]);
}
