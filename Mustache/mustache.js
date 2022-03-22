//Todo 类型会被转换为string 使用模版解析时
import {render} from "./index.js";
import {isMustache, isNotArray, isNull} from "../util";
import {warn} from "../log";

export function mustaches(text, context, isLog = true) {
    let result;
    let error;
    if (isNotArray(context)) context = [context];
    for (const ctx of context) {
        try {
            result = render(text,
                            ctx);
            break;
        } catch (e) {
            error = e;
        }
    }
    if (isLog && isNull(result)) {
        warn(error.message);
        return '';
    }
    return result ;
}

/**
 * @param {string} stencil
 * @param {any} view
 * @return {object|string|number|boolean}
 */
export default function mustache(stencil, view) {
    return ProcessingText(stencil,
                          view);
}

/**
 * @param {string} stencil
 * @param {any} view
 * @returns {string|boolean|Function|object}
 */
export function propsMustache(stencil, view) {
    try {
        return isMustache(stencil) ? mustache(stencil,
                                              view) : render(stencil,
                                                             view);
    } catch (e) {
        return stencil;
    }

}

/**
 * code 1 :render
 * @param text
 * @return {*}
 */
export function packageValue(text) {
    const stencilRegexp = /{{([\w\W]*?)}}|\${([\w\W]*?)}/g;
    let match;
    let stencil = [];
    let index = 0;
    if ((match = stencilRegexp.exec(text)) !== null) {
        do {
            // s l
            let lastIndex = stencilRegexp.lastIndex;
            if (match.index > index) {
                stencil.push([`${text.slice(index,
                                            match.index)}`,
                              0]);
            }
            stencil.push([match[1] ?? match[2],
                          1]);
            index = lastIndex;
        } while ((match = stencilRegexp.exec(text)) !== null);
        if (index < text.length) {
            stencil.push([`${text.slice(index,
                                        text.length)}`,
                          0]);
        }
        return stencil;
    } else return [[text,
                    0]];
}


/**
 * @param {string} text
 * @param view
 * @returns {string}
 */
export function ProcessingText(text, view) {
    const stencilRegexp = /{{([\w\W]*?)}}|\${([\w\W]*?)}/g;
    let match;
    let stencil = [];
    let index = 0;
    if ((match = stencilRegexp.exec(text)) !== null) {
        do {
            // s l
            let lastIndex = stencilRegexp.lastIndex;
            if (match.index > index) {
                stencil.push(`${text.slice(index,
                                           match.index)}`);
            }
            stencil.push(render(match[1] ?? match[2],
                                view));
            index = lastIndex;
        } while ((match = stencilRegexp.exec(text)) !== null);
        if (index < text.length) {
            stencil.push(`${text.slice(index,
                                       text.length)}`);
        }
        return stencil.reduce((a, b) => a + b);
    } else return text;
}
