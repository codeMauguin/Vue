//Todo 类型会被转换为string 使用模版解析时
import { render } from "./index.js";
import { isMustache } from "../util/index.js";

/**
 * @param {string} stencil
 * @param {any} view
 */
export default function mustache(stencil, view) {
  return render(ProcessingText(stencil), view);
}

/**
 * @param {string} stencil
 * @param {any} view
 * @returns {string|boolean|Function|object}
 */
export function propsMustache(stencil, view) {
  return isMustache(stencil) ? mustache(stencil, view) : render(stencil, view);
}

/**
 * @param {string} text
 * @returns {string}
 */
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
        stencil.push(`\`${text.slice(index, match.index)}\``);
      }
      stencil.push(`(${match[1] ?? match[2]})`);
      index = lastIndex;
    } while ((match = stencilRegexp.exec(text)) !== null);
    if (index < text.length) {
      stencil.push(`\`${text.slice(index, text.length)}\``);
    }
    return stencil.join("+");
  } else return text;
}
