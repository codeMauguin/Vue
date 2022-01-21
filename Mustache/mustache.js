import ViewRender from "./ViewRender.js";

//Todo 类型会被转换为string 使用模版解析时
/**
 * @param {string} stencil
 * @param {{ [x: string]: any; }} view
 */
export default function mustache(stencil, view) {
    return h.apply({...view, _v: h.bind(view)}, [ProcessingText(stencil)]);
}

export function ProcessingText(text) {
    const stencilRegexp = /{{(.+?)}}|\${(.+?)}/g;
    let match;
    let stencil = "";
    let index = 0;
    if ((match = stencilRegexp.exec(text)) !== null) {
        do {
            let str;
            let i = match[0].length;
            if ((str = match[1]) === undefined) {
                str = match[2];
            }
            if (match.index > index) {
                stencil += `"${text.slice(index, match.index)}"+` + `_v(${str})`
            } else {
                stencil += `_v(${str})`
            }
            if ((match = stencilRegexp.exec(text)) !== null) {
                stencil += "+";
                index += i;
            } else if (index + i + 1 < text.length) {
                stencil += `+ "${text.slice(index + i + 1, text.length)}"`
                break;
            } else {
                break;
            }
        } while (true)
    } else return `${text}`;
    return stencil;
}

/**
 * 将模版解析
 * @param {string} stencil
 * @param {object} view
 * @returns object
 */
function h(stencil) {
    return ViewRender(stencil, this);
}
