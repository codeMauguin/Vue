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
                elm.classList.add(...value.splice(" "));
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
            let data = node.static ? value.map(val => val[0])
                                          .join('') :
                value.map(val => val[1] === 1 ? mustaches(val[0],
                                                         node.context) : val[0])
                     .reduce((a,
                              b) => a + b);
            return node.elm = document.createTextNode(data);
        }
        case "COMMENT":
            return node.elm = document.createElement(node.value);
    }
}
