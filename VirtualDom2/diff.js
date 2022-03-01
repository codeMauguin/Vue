import { ENode, removeAttribute, setAttribute } from "./index.js";
import { isNotNull, isNull } from "../util/index.js";

/**
 * @param {HTMLElement} elm
 * @param {DocumentFragment} newElm
 * @param {HTMLElement} oldElm
 */
function insertBefore(elm, newElm, oldElm) {
  elm.insertBefore(newElm, oldElm);
}

/**
 * @param {{ isInstance: (arg0: any) => any; equal: (arg0: any) => any; }} node1
 * @param {any} node2
 */
function same(node1, node2) {
  return node1.isInstance(node2) && node1.equal(node2);
}

/**
 * @param {HTMLElement} parenElm
 * @param { Array<ENode|TNode>} oldNode
 * @param { any[]} newNode
 */
export function diff(parenElm, oldNode, newNode) {
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
    } else if (same(oldStart, newStart)) {
      patchNode(oldStart, newStart);
      oldStart = oldNode[++oldStartIndex];
      newStart = newNode[++newStartIndex];
    } else if (same(oldEnd, newEnd)) {
      patchNode(oldEnd, newEnd);
      oldEnd = oldNode[--oldEndIndex];
      newEnd = newNode[--newEndIndex];
    } else if (same(oldStart, newEnd)) {
      patchNode(oldStart, newEnd);
      // @ts-ignore
      insertBefore(parenElm, oldStart.elm, oldEnd.elm.nextSibling);
      oldStart = oldNode[++oldStartIndex];
      newEnd = newNode[--newEndIndex];
    } else if (same(oldEnd, newStart)) {
      patchNode(oldEnd, newStart);
      // @ts-ignore
      insertBefore(parenElm, oldEnd.elm, oldStart.elm);
      oldEnd = oldNode[--oldEndIndex];
      newStart = newNode[++newStartIndex];
    } else {
      let os = oldStartIndex;
      let od = oldEndIndex;
      while (++os <= od) {
        if (isNotNull(oldNode[os]) && same(oldNode[os], newStart)) {
          break;
        }
      }
      if (os > od) {
        //创建
        const elm = newStart.init();
        // @ts-ignore
        insertBefore(parenElm, elm, oldStart.elm);
      } else {
        patchNode(oldNode[os], newStart);
        // @ts-ignore
        insertBefore(parenElm, newStart.elm, oldStart.elm);
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
    insertBefore(parenElm, fam, newNode[newStartIndex - 1].elm.nextSibling);
  } else {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      if (oldNode[i]) parenElm.removeChild(oldNode[i].elm);
    }
  }
}

/**
 * @param {ENode | TNode} oldNode
 * @param {ENode | TNode} newNode
 */
export function patchNode(oldNode, newNode) {
  const elm = (newNode.elm = oldNode.elm);
  if (newNode instanceof ENode) {
    if (newNode.static) {
      //nothing to do
    } else {
      // @ts-ignore
      const { attributes: oldAttr } = oldNode.props;
      const { attributes: newAttr } = newNode.props;
      const oldKeys = Object.keys(oldAttr);
      const newKeys = Object.keys(newAttr);
      //去交集更新+新数组差集
      oldKeys
        .filter((ok) => newKeys.includes(ok))
        .concat(...newKeys.filter((nK) => !oldKeys.includes(nK)))
        .forEach((uk) => {
          setAttribute(elm, uk, newAttr[uk], oldAttr[uk]);
        });
      //去差集删除
      oldKeys
        .filter((fk) => !newKeys.includes(fk))
        .forEach((dk) => {
          removeAttribute(elm, oldAttr[dk]);
        });
      // 更新完毕
    }
    //@ts-ignore
    //更新children
    if (newNode.children.length > 0)
      if (oldNode.children.length > 0)
        //@ts-ignore
        //@ts-ignore
        diff(elm, oldNode.children, newNode.children);
      else {
        const fam = document.createDocumentFragment();
        newNode.children.forEach((child) => {
          //@ts-ignore
          fam.appendChild(child.init());
        });
        elm.appendChild(fam);
      }
    //@ts-ignore
    else if (oldNode.children.length > 0) {
      // @ts-ignore
      elm.innerHTML = "";
    }
  } else {
    // @ts-ignore
    if (oldNode.text !== newNode.text) {
      // @ts-ignore
      elm.innerText = newNode.text;
    }
  }
}
