import {isObject} from "../util";

function renderAttributes(elm,
                          attributes) {
    for (let index = 0; index < attributes.length; ++index) {
        let [key, value] = attributes[index];
        switch (key) {
            case "class": {
                elm.classList.add(...String(value)
                    .split(" "));
            }
                break;
            case "style": {
                if (isObject(value)) {
                    for (let ownKey of Reflect.ownKeys(value)) {
                        elm.style.setProperty(ownKey,
                                              value[ownKey]);
                    }
                } else {
                    const regExp = /((?<key>\w+):(?<value>\w+);?)/g;
                    let style;
                    while ((style = regExp.exec(value)) !== null) {
                        elm.style.setProperty(style.groups.key,
                                              style.groups.value);
                    }
                }
            }
                break;
            case "ref": {
                value(elm);
            }
                break;
            case "click": {
                elm.addEventListener(key,
                                     value);
            }
                break;
        }

    }
}

/**
 *
 * @param node
 * @param el
 * @return {Text|Comment|*}
 */

export function render(node) {
    switch (node.type) {
        case "ELEMENT": {
            const elm = node.elm = document.createElement(node.tagName);
            renderAttributes(elm,
                             node.attributes);
            for (const children of node.children) {
                elm.appendChild(render(children));
            }
            return elm;
        }
        case "TEXT-NODE": {
            const {value} = node;
            return node.elm = document.createTextNode(value);
        }
        case "COMMENT":
            return node.elm = document.createComment(node.value);
    }
}
