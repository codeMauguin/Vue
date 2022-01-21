class TNode{
}
class ENode {
  sel: string;
  attributes: object;
  children: Array<ENode | TNode>;
  constructor(sel: string, attributes: object, children: Array<ENode | TNode>) {
    this.sel = sel;
    this.attributes = attributes;
    this.children = children;
  }
}
