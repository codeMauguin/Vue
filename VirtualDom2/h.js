/**
 * @param {string} tagName
 * @param {NamedNodeMap | null} attributes
 * @param {NodeListOf<ChildNode> | null} children
 */
export default function h(tagName, attributes, children) {
  if (attributes === null && children === null) {
    return `_t(${JSON.stringify(tagName)})`;
  }
  const childrenNodes = new Array(0);
  // @ts-ignore
  for (const child of children) {
    if (child instanceof HTMLElement) {
      childrenNodes.push(h(child.tagName, child.attributes, child.childNodes));
    } else if (child instanceof Comment) {
    } else {
      // @ts-ignore
      childrenNodes.push(h(child.textContent, null, null));
    }
  }
  return `_c(${JSON.stringify(tagName)},${stringify(
    attributes,
  )}, [ ${childrenNodes} ] )`;
}
function stringify(attributes) {
  const attr = {};
  for (const [_, { name, value }] of Object.entries(attributes)) {
    attr[name] = value;
  }
  return JSON.stringify(attr);
}
