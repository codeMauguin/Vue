import { equal } from "../util/index.js";

export default class Node {
    #elm;
    isStatic = false;
    children = new Array(0);
    mountStaticProps() {}

    /**
     * @returns {HTMLElement}
     */
    get elm() {
        return this.#elm;
    }

    /**
     * @param {HTMLElement} value
     */
    set elm(value) {
        this.#elm = value;
    }

    mountEven(context) {}

    /**
     * 比较节点不同，排除子节点
     * @param {Node} node
     * @returns 节点相同-true 不同返回不同的属性
     */
    equal(node) {
        if (this === node) {
            return true;
        }
        if (this.toString() === node.toString()) {
            const keys = Object.keys(this).splice(
                Object.keys(this).indexOf("children"),
                1,
            );
            const result = keys.filter(key => equal(this[key], node[key]));
            return result.length === keys.length;
        }
        return false;
    }

    /**
     * 克隆对象
     * @returns Node
     */
    clone() {
        const clone = this.of();
        return Object.assign(clone, this);
    }

    of() {
        return this;
    }
}
