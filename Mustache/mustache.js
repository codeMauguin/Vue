//Todo 类型会被转换为string 使用模版解析时
import {render} from "./index.js";
import {isMustache} from "../util/index.js";

/**
 * @param {string} stencil
 * @param {{ [x: string]: any; }} view
 */
export default function mustache(stencil, view) {
    let text = ProcessingText(stencil);
    let first = text.shift();
    return text.reduce((previousValue, currentValue) => {
        return previousValue + extracted(currentValue, view);
    }, extracted(first, view));
}

export function propsMustache(stencil, view) {
    return isMustache(stencil) ? mustache(stencil, view) : render(stencil, view);
}

function extracted(template, view) {
    if (template.h) {
        return render(template.stencil, view);
    } else {
        return template.stencil;
    }
}


export function ProcessingText(text) {
    const stencilRegexp = /{{(.+?)}}|\${(.+?)}/g;
    let match;
    let stencil = [];
    let index = 0;
    if ((match = stencilRegexp.exec(text)) !== null) {
        do {
            // s l
            let lastIndex = stencilRegexp.lastIndex;
            if (match.index > index) {
                stencil.push({
                    h: false, stencil: text.slice(index, match.index)
                });
                stencil.push({
                    h: true, stencil: match[1] ?? match[2]
                });
            } else {
                stencil.push({
                    h: true, stencil: match[1] ?? match[2]
                })
            }
            if ((match = stencilRegexp.exec(text)) !== null) {
                index = lastIndex;
            } else if (lastIndex < text.length) {
                stencil.push({
                    h: false, stencil: text.slice(lastIndex, text.length)
                })
                break;
            } else {
                break;
            }
        } while (true)
    } else return [{h: false, stencil: text}];
    return stencil;
}
