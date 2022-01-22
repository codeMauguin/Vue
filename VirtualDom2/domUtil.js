const styleKeys = Object.keys(document.documentElement.style);

export function setAttribute(elm, name, value) {
  if (styleKeys.includes(name)) {
    elm.style[name] = value;
  } else if (name === "class") {
    elm.classList.add(value.split(" "));
  } else if (name === "if" || name === "else-if" || name === "else") {
    console.log(1, name);

  } else {
    elm.setAttribute(name, value);
  }
}

/**
 * @param {HTMLElement} elm
 * @param {string} name
 * @param {Function} fn
 */
export function dispatchEvent(elm, name, fn) {
  // @ts-ignore
  elm.addEventListener(name, fn);
}

export function create(node) {
  if (node instanceof v) {
    const elm = node.elm = document.createElement(node.tagName);
    for (const [key, value] of Object.entries(node.attr)) {
      setAttribute(elm, key, value)
    }
    for (const [key, value] of Object.entries(node.props.attr)) {
      setAttribute(elm, key, value)
    }
    for (const [key, fn] of Object.entries(node.props.methods)) {
      dispatchEvent(elm, key, fn);
    }
    for (const child of node.children) {
      elm.appendChild(create(child));
    }
    return elm;
  } else {
    const elm = node.elm = document.createTextNode(node.text);
    return elm;
  }
}
