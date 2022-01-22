import {isNull} from "../util/index.js";

const render = ( /** @type {string} */ stencil, target) => {
    const template = `with(this){  return ${stencil}}`;
    try {
        let parseResults = new Function(template).call(target);
        if (isNull(parseResults)) {
            return stencil;
        }
        return parseResults;
    } catch (e) {
        console.error(e
            , target);
        return stencil;
    }
};
export default render;
