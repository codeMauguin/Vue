import {mustaches} from "../Mustache";


function renderAttributes(node,
                          elm) {
    const {attributes = []} = node;
    for (let index = 0; index < attributes.length; ++index) {
        let [key, value, type] = attributes[index];
        value = type === 1 ? mustaches(value,
                                       node.context) : value;
        attributes[index][1] = value;
        switch (key) {
            case "class": {
                elm.classList.add(...String(value)
                    .split(" "));
            }
                break;
            case "style": {
                if (type === 1) {
                    for (let ownKey of Reflect.ownKeys(value)) {
                        elm.style[ownKey] = value[ownKey];
                    }
                } else {
                    const regExp = /((?<key>\w+):(?<value>\w+);?)/g;
                    let style;
                    while ((style = regExp.exec(value)) !== null) {
                        elm.style[style.groups.key] = style.groups.value;
                    }
                }
            }
        }

    }
}

/**
 *
 * @param node
 * @return {Text|Comment|*}
 */

export function render(node) {
    switch (node.type) {
        case "ELEMENT": {
            const elm = node.elm = document.createElement(node.tagName);
            renderAttributes(node,
                             elm);
            for (const children of node.children) {
                elm.appendChild(render(children));
            }
            return elm;
        }
        case "TEXTNODE": {
            const {value} = node;
            return node.elm = document.createTextNode(value);
        }
        case "COMMENT":
            return node.elm = document.createComment(node.value);
    }
}
