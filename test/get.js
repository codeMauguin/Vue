function loopGetter(target, key) {
  return {
    get [key]() {
      return target;
    },
  };
}
function loopSetter(target, key, value) {
  return {
    set [key](value) {
      target[key] = value;
    },
  };
}
class test {
  constructor(config) {
    for (let i of Reflect.ownKeys(config)) {
      Reflect.defineProperty(this, i, {
        get() {
          return loopGetter(config[i], i)[i];
        },
        enumerable: false,
        set(v) {
          loopSetter(config, i, v)[i] = v;
        },
      });
    }
  }
}
let tests = new test({
  id: 1,
  name: 2,
});
tests.id = {};
console.log(tests);
