import {isNull} from "../util";

const render = ( /** @type {string} */ stencil, target) => {
    const template = `with(this){  return ${stencil}}`;
        let parseResults = new Function(template).call(target);
        if (isNull(parseResults)) {
            return stencil;
        }
        return parseResults;
};
export default render;
