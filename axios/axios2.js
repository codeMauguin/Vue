import {isNotNull, isNull, isString} from "../util/index.js";

const DEFAULT_REJECT = (err) => Promise.reject(err),
    DEFAULT_RESOLVE = (suc) => Promise.resolve(suc);
const Task = (then) => ({
    then,
    map: (mapResolve = DEFAULT_RESOLVE, mapReject = DEFAULT_REJECT) => Task((resolve = DEFAULT_RESOLVE, reject = DEFAULT_REJECT) => then((success) => resolve(mapResolve(success)), (error) => reject(mapReject(error)),),),
});

class Tasks {
    #sucArray = [];
    #rejectArray = [];
    #task = {
        "default": Task((resolve, reject) => {
            if (this.#sucArray.length > 0) {
                resolve(this.#sucArray.shift());
            } else if (this.#rejectArray.length > 0) {
                reject(this.#rejectArray.shift());
            }
        })
    }

    map(resolve, reject, group) {
        if (isNull(this.#task[group])) {
            // 初始化
            this.#task[group] = Task((resolve, reject) => {
                if (this.#sucArray.length > 0) {
                    resolve(this.#sucArray.shift());
                } else if (this.#rejectArray.length > 0) {
                    reject(this.#rejectArray.shift());
                }
            });
        }
        this.#task[group] = this.#task[group].map(resolve, reject);
        return this;
    }

    executor(resolve, reject, group = "default") {
        if (isNull(this.#task[group])) return isNull(reject) ? resolve : reject;
        if (isNotNull(resolve)) {
            this.#sucArray.push(resolve);
        } else if (isNotNull(reject)) {
            this.#rejectArray.push(reject);
        }
        let sucResult = null, rejectResult = null;
        this.#task[group].then((resolve) => {
            sucResult = resolve;
        }, (reject) => {
            rejectResult = reject;
        },);
        return isNotNull(sucResult) ? sucResult : rejectResult;
    }
}

class Processor {
    default;
    requestTask = new Tasks();
    responseTask = new Tasks();
    interceptors;

    constructor(config) {
        const that = this;
        this.interceptors = {
            request: {
                use(successCallback, errorCallback, group = "default") {
                    that.requestTask.map(successCallback, errorCallback, group);
                },
            }, response: {
                use(successCallback, errorCallback, group = "default") {
                    that.responseTask.map(successCallback, errorCallback, group);
                },
            },
        };
        this.default = {
            // @ts-ignore
            set baseURL(urlConfig) {
                if (isString(urlConfig)) {
                    // @ts-ignore
                    let index = this._baseURL.findIndex((r) => r.name === "default");
                    if (index > -1) {
                        // @ts-ignore
                        this._baseURL[index].url = urlConfig;
                    } else {
                        // @ts-ignore
                        this._baseURL.push({
                            // @ts-ignore
                            name: "default", // @ts-ignore
                            url: urlConfig,
                        });
                    }
                } else {
                    // @ts-ignore
                    let {name, url} = {name: urlConfig.name, url: urlConfig.url};
                    // @ts-ignore
                    let index = this._baseURL.findIndex((r) => r.name === name);
                    if (index > -1) {
                        // @ts-ignore
                        this._baseURL[index].url = url;
                    } else {
                        // @ts-ignore
                        this._baseURL.push({name, url});
                    }
                }
            }, get baseURL() {
                if (this._baseURL.length === 0) {
                    return "";
                }
                // @ts-ignore
                return this._baseURL.find((r) => r.name === "default")?.url ?? "";
            }, _baseURL: [], // @ts-ignore
            timeout: 3000, get(name) {
                if (isNull(name)) {
                    return this.baseURL;
                }
                //@ts-ignore
                return this._baseURL.find((r) => r.name === name).url;
            },
        };
        if (isString(config)) {
            this.default.baseURL = config;
        } else {
            let {baseURL = "", timeout = 3000} = config;
            this.default.baseURL = baseURL;
            this.default.timeout = timeout;
        }
    }

    // @ts-ignore
    request(config) {
        let group = config["group"];
        const filter = this.requestTask.executor({
            ...config,
            url: config["url"]
        }, null, group) || {};
        let url = `${this.default.get(group)}${filter["url"]}`;
        let timeout = filter["timeout"];
        if (isNull(timeout)) {
            timeout = this.default.timeout;
        }
        let body = filter["body"];
        // @ts-ignore
        const about = new AbortController();
        // @ts-ignore
        let timer = new Promise((_resolve, reject) => {
            setTimeout(() => {
                reject({
                    message: `The request has timed out ${timeout} ms time`, errorCode: 500,
                });
                about.abort();
            }, timeout);
        });
        return Promise.race([timer, fetch(url, {
            body: filter["method"] === "GET" ? null : body, signal: about.signal, ...filter,
        }),]).then(suc => {
            if (suc.status === 200) return this.responseTask.executor(suc, null, group); else {
                return Promise.reject(this.responseTask.executor(null, suc, group));
            }
        }, reason => {
            if (reason.errorCode === 500) return Promise.reject(this.requestTask.executor(null, reason, group));
            return Promise.reject(this.responseTask.executor(null, reason, group));
        },);
    }
}

export default class extends Processor {
    constructor(config) {
        super(config);
    }

    get(url, config) {
        return super.request({
            url, ...config, method: "GET",
        });
    }

    post(url, config) {
        return super.request({
            url, ...config, method: "POST",
        });
    }
}
