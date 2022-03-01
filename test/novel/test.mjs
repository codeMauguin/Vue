function $render(key) {
    const runCompilation = `
  try{
    with(this){return ${key};}
  }catch(e){return "";}
  `;
    return new Function(runCompilation).apply(this
    );
}

function replace(_, key) {
    return $render.call(this, key);
}

/**
 * 编译模板内容
 * @param {string} template
 * @param {object} thisArg
 */
export const render = (template, thisArg) => {
    return template.replace(/{{([\w\W]+)}}/g, replace.bind(thisArg)).replace(/\${([\w\W]+)}/g, replace.bind(thisArg));
}
