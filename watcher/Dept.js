class Dept {
    #value = [];

    /**
     * @param {any} context
     */
    $emit(context) {
        this.#value.push(context);
    }

    notifyAll() {
        this.#value.forEach(e => e.update());
    }
}

const dept = new Dept();
export default dept
