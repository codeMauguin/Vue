const render = (target, stencil) => {
    const template = `with(target){  return ${stencil}}`;
    return new Function("target", template)(target);
};
export default render;
