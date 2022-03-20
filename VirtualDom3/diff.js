import {isNotNull, isNull} from "../util";
import {compare as patchNode, same} from "./";

function insertBefore(elm,
                      newElm,
                      oldElm) {
    elm.insertBefore(newElm,
                     oldElm);
}


/**
 * @param {HTMLElement} parenElm
 * @param { Array<ENode|TNode>} oldNode
 * @param { any[]} newNode
 */
export function diff(parenElm,
                     oldNode,
                     newNode) {
    let oldStartIndex = 0;
    let oldEndIndex = oldNode.length - 1;
    let newStartIndex = 0;
    let newEndIndex = newNode.length - 1;
    let oldStart = oldNode[oldStartIndex];
    let oldEnd = oldNode[oldEndIndex];
    let newStart = newNode[newStartIndex];
    let newEnd = newNode[newEndIndex];
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        if (isNull(oldStart)) {
            oldStart = oldNode[++oldStartIndex];
        } else if (isNull(oldEnd)) {
            oldEnd = oldNode[--oldEndIndex];
        } else if (same(oldStart,
                        newStart)) {
            patchNode(oldStart,
                      newStart);
            oldStart = oldNode[++oldStartIndex];
            newStart = newNode[++newStartIndex];
        } else if (same(oldEnd,
                        newEnd)) {
            patchNode(oldEnd,
                      newEnd);
            oldEnd = oldNode[--oldEndIndex];
            newEnd = newNode[--newEndIndex];
        } else if (same(oldStart,
                        newEnd)) {
            patchNode(oldStart,
                      newEnd);
            // @ts-ignore
            insertBefore(parenElm,
                         oldStart.elm,
                         oldEnd.elm.nextSibling);
            oldStart = oldNode[++oldStartIndex];
            newEnd = newNode[--newEndIndex];
        } else if (same(oldEnd,
                        newStart)) {
            patchNode(oldEnd,
                      newStart);
            // @ts-ignore
            insertBefore(parenElm,
                         oldEnd.elm,
                         oldStart.elm);
            oldEnd = oldNode[--oldEndIndex];
            newStart = newNode[++newStartIndex];
        } else {
            let os = oldStartIndex;
            let od = oldEndIndex;
            while (++os <= od) {
                if (isNotNull(oldNode[os]) && same(oldNode[os],
                                                   newStart)) {
                    break;
                }
            }
            if (os > od) {
                //创建
                const elm = newStart.init();
                // @ts-ignore
                insertBefore(parenElm,
                             elm,
                             oldStart.elm);
            } else {
                patchNode(oldNode[os],
                          newStart);
                // @ts-ignore
                insertBefore(parenElm,
                             newStart.elm,
                             oldStart.elm);
                // @ts-ignore
                oldNode[os] = undefined;
            }
            newStart = newNode[++newStartIndex];
        }
    }
    if (oldStartIndex > oldEndIndex) {
        var fam = document.createDocumentFragment();
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            fam.appendChild(newNode[i].init());
        }
        insertBefore(parenElm,
                     fam,
                     newNode[newStartIndex - 1].elm.nextSibling);
    } else {
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            if (oldNode[i]) parenElm.removeChild(oldNode[i].elm);
        }
    }
}
