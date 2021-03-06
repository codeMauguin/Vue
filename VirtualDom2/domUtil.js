const styleKeys = Object.keys(document.documentElement.style);

export function setAttribute(elm, name, value) {
    if (styleKeys.includes(name)) {
        elm.style[name] = value;
    } else if (name === "class") {
        if (arguments[3] !== undefined) {
            let oldV = arguments[3].split(" ");
            const newValues = value.split(" ");
            const newAdd = newValues.filter(r => !oldV.includes(r));
            elm.classList.remove(...oldV.filter(r => !newValues.includes(r)))
            elm.classList.add(...newAdd);
        } else elm.classList.add(...value.split(" "));
    } else if (name === "if" || name === "else-if" || name === "else" || name === "key") {
    } else {
        elm.setAttribute(name, value);
    }
}

export function removeAttribute(elm, name, value) {
    if (styleKeys.includes(name)) {
        elm.style[name] = "";
    } else if (name === "class") {
        elm.classList.remove(...value.split(" "));
    } else if (name === "if" || name === "else-if" || name === "else") {
    } else {
        elm.removeAttribute(name, value);
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
