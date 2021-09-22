const stencilRegexp = /\{\{(.+?)\}\}/gi;
import { ViewRender } from "./index.js";

/**
 * 将模版解析
 * @param {string} stencil
 * @param {object} view
 * @param defaults
 * @returns object
 */
export default function render(stencil, view, defaults = "") {
    return stencil.replace(stencilRegexp, (_, stencil) => {
        try {
            return ViewRender(
                { ...view, ...view._data, ...view._methods },
                stencil,
            );
        } catch (e) {
            return defaults;
        }
    });
}
