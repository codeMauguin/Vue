import {diff, render} from "./";

export function compare(oldNode,
                        newNode) {
    const elm = (newNode.elm = oldNode.elm);
    if (newNode.type === "ELEMENT") {
        const {attributes: oldAttrs = []} = oldNode;
        const {attributes: newAttrs = []} = newNode;
        for (let index = 0; index < newAttrs.length; ++index) {
            const newAttr = newAttrs[index];
            const oldAttr = oldAttrs[index];
            if (!Object.is(newAttr[1],
                           oldAttr[1])) {
                //Todo 更新程序

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

export function same(oldNode,
                     newNode) {
    return Object.is(oldNode.type,
                     newNode.type) && Object.is(oldNode.key,
                                                newNode.key) && Object.is(oldNode?.tagName ?? oldNode.value,
                                                                          newNode?.tagName ?? newNode.value) && Object.is(oldNode?.attributes?.length,
                                                                                                                          newNode?.attributes?.length) && Object.is(oldNode?.props?.length,
                                                                                                                                                                    newNode?.props?.length);
}
