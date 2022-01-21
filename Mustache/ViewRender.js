import {isNull} from "../util/index.js";

const render = ( /** @type {string} */ stencil, target) => {
    const template = `with(target){  return ${stencil}}`;
    try {
        let parseResults = new Function("target", template)(target);
        if (isNull(parseResults)) {
            return stencil;
        }
        return parseResults;
    } catch (e) {
        return stencil;
    }
};
export default render;
