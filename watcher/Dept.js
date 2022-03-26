class Dept {
    #value = [];

    /**
     * @param {any} context
     * @param {{even: *, key: string}}updateEvent 更新方法
     */
    $emit(context,
          updateEvent) {
        this.#value.push([context,
                             updateEvent]);
    }

    notifyAll() {
        this.#value.forEach(async ([context, updateEvent]) => {
            if (!context[updateEvent["key"]]) {
                updateEvent.even(updateEvent);
            } else {
                updateEvent.wait(updateEvent.even);
            }
        });
    }
}

const dept = new Dept();
export default dept ?? new Dept();
