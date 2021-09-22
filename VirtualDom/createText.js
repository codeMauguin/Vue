/**
 *
 * @param {TNode} tnode
 */
export default function createText(tnode) {
    return document.createTextNode(
        tnode.textContent
    );
}