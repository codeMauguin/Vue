import {warn} from "../log";

const dept = () => ({
    id: [],
    index: 0,
    watcher(fn) {
        this.id[this.index++] = fn;
        return this.unWatcher.bind(this,
                                   this.index - 1);
    },
    notify(newVal,
           oldVal) {
        for (let i = 0; i < this.id.length; ++i) {
            if (this.id[i]) {
                this.id[i](newVal,
                           oldVal,
                           this.unWatcher.bind(this,
                                               i));
            }
        }
    },
    unWatcher(index) {
        if (this.id[index]) delete this.id[index]; else warn(`props is destroy`)
    }
})

export const watcher = (target,
                        fn) => {
    if (!target.__ob__) {
        target.__ob__ = dept();
    }
    return target.__ob__.watcher(fn);

};
