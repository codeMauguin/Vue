//Todo 类型会被转换为string 使用模版解析时
import {render} from "./index.js";
import {isMustache} from "../util/index.js";

/**
 * @param {string} stencil
 * @param {any} view
 */
export default function mustache(stencil, view) {
    return render(ProcessingText(stencil), view);

}

export function propsMustache(stencil, view) {
    return isMustache(stencil) ? mustache(stencil, view) : render(stencil, view);
}

export function ProcessingText(text) {
    const stencilRegexp = /{{(.+?)}}|\${(.+?)}/g;
    let match;
    let stencil = "";
    let index = 0;
    if ((match = stencilRegexp.exec(text)) !== null) {
        do {
            // s l
            let lastIndex = stencilRegexp.lastIndex;
            if (match.index > index) {
                stencil += `\`${text.slice(index, match.index)}\`+(${match[1] ?? match[2]})`
            } else {
                stencil += `(${match[1] ?? match[2]})`;
            }
            if ((match = stencilRegexp.exec(text)) !== null) {
                stencil += "+";
                index = lastIndex;
            } else if (lastIndex < text.length) {
                stencil += `+\`${text.slice(lastIndex, text.length)}\``;
                break;
            } else {
                break;
            }
        } while (true)
    } else return stencil;
    return stencil;
}
