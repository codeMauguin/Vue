import {diff, render} from "./";
import {equal, isNotNull, updateArray, updateObject} from "../util";

export function compare(oldNode,
                        newNode) {
    const elm = (newNode.elm = oldNode.elm);
    if (newNode.type === "ELEMENT") {
        const {dynamicProps: oldAttrs = []} = oldNode, {dynamicProps: newAttrs = []} = newNode,
            oldProps = {}, newProps = {};
        for (let index = 0; index < newAttrs.length; ++index) {
            const newAttr = newAttrs[index];
            const oldAttr = oldAttrs[index];
            if (!Object.is(newAttr[1],
                           oldAttr[1])) {
                if (oldProps[oldAttr[0]]) {
                    oldProps[oldAttr[0]].push(oldAttr[1]);
                } else {
                    oldProps[oldAttr[0]] = [oldAttr[1]];
                }
                if (newProps[newAttr[0]]) {
                    newProps[newAttr[0]].push(newAttr[1]);
                } else {
                    newProps[newAttr[0]] = [newAttr[1]];
                }
            }
        }
        for (const key of Object.keys(newProps)) {
            switch (key) {
                case "class": {
                    let oldProp = oldProps[key].join(" ");
                    let newProp = newProps[key].join(" ");
                    let {del, add} = updateArray(oldProp.split(" "),
                                                 newProp.split(" "));
                    elm.classList.remove(...del);
                    elm.classList.add(...add);
                }
                    break;
                case "style": {
                    let old = oldProps[key].reduce((a,
                                                    b) => Object.assign(a,
                                                                        b),
                                                   {});
                    let reduce = newProps[key].reduce((a,
                                                       b) => Object.assign(a,
                                                                           b),
                                                      {});
                    const {del, add, update} = updateObject(old,
                                                            reduce);
                    for (const key of del) {
                        elm.style.setProperty(key,
                                              "");
                    }
                    for (const [key, value] of add.concat(update)) {
                        elm.style.setProperty(key,
                                              value);
                    }
                }
                    break;
            }
        }

        if (newNode.children.length > 0) if (oldNode.children.length > 0) {
            diff(elm,
                 oldNode.children,
                 newNode.children);
        } else {
            const fam = document.createDocumentFragment();
            for (const child of newNode.children) {
                fam.appendChild(render(child));
            }
            elm.appendChild(fam);
        } else {
            elm.innerHTML = "";
        }
    } else {
        if (!Object.is(newNode.value,
                       oldNode.value)) {
            elm.textContent = newNode.value;
        }
    }

}

/**
 *
 * @param oldNode
 * @param newNode
 * @return {boolean}
 */
export function same(oldNode,
                     newNode) {
    return isNotNull(oldNode.key) && Object.is(oldNode.key,
                                               newNode.key) || Object.is(oldNode.key,
                                                                         newNode.key) && Object.is(oldNode.type,
                                                                                                   newNode.type) && Object.is(oldNode?.tagName ?? oldNode.value,
                                                                                                                              newNode?.tagName ?? newNode.value) && equal(oldNode?.attributes,
                                                                                                                                                                          newNode?.attributes) && equal(oldNode?.props,
                                                                                                                                                                                                        newNode?.props)
}
