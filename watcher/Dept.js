class Dept {
    #value = [];

    add(context) {
        this.#value.push(context);
    }

    notify() {
        this.#value.forEach(e => e.update());
    }
}

const dept = new Dept();
export default dept || new Dept()