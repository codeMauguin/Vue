export class Parser {
  /**
   * Parser a string into a AST
   * @param {string} String
   */
  parser(String) {
    //
  }
  Program() {}
  /**
   * Parser Comment Node
   */
  CommentLiteral() {}
  /**
   * Parser Element
   * :{body:Array<Element|TextNode>,attributes:obkect}
   */
  ElementLiteral() {}
  /**
   * Parser TextNode
   */
  TextNodeLiteral() {
    return {
      type: "TextNodeLiteral",
      value: String,
    };
  }
}
