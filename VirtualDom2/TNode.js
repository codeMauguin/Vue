// @ts-nocheck
import { Node } from "./index.js";
import { mustache as h } from "../Mustache/index.js";
import Vue from "../Vue/Vue.js";
import { ref } from "../proxy/index.js";
export default class TNode extends Node {
  _text;
  get text() {
    return this._text;
  }
  set text(text) {
    if (text instanceof ref) {
      this._text = text.value;
    } else this._text = text;
  }
  isStatic = true;
  /**
     @type{Text}
     */
  // @ts-ignore
  elm;

  /**
   * 仅仅做没有else 的处理 if
   */
  key;

  /**
   */
  constructor(text) {
    super();
    this.text = text;
    this.key = this.text.length << 5;
  }

  /**
   * @param {any} context
   */
  render(context) {
    this.text = h(
      this.text,
      context instanceof Vue ? context["&data"] : context,
    );
  }

  /**
   *
   * @return {Text}
   */
  init() {
    // @ts-ignore
    return (this.elm = document.createTextNode(this.text));
  }

  clone() {
    return Object.create({
      __proto__: TNode.prototype,
      text: this.text,
      isStatic: this.static,
    });
  }

  /**
   * @param {Node | import("./ENode.js").default} other
   */
  equal(other) {
    return (
      this.key === other.key &&
      this.isInstance(other) &&
      this.text === other.text
    );
  }
}
