// const monitor = (target) => {
//   const state = {
//     type: String,
//     load: Object,
//     hook: Function,
//   };
// };
function dispatch(state) {
  this.state[state]?._hook(this);
}
function set(target, propertyKey, value, receiver) {
  if (Reflect.get(target, propertyKey, receiver) === value) {
    return true;
  }
  dispatch(value);
  return Reflect.set(target, propertyKey, value, receiver);
}
class monitor {
  state = {};
  constructor(config = {}) {
    Object.keys(config).forEach((key) => {
      this.state[key] = { _hook: config[key] };
    });
  }
  dispatch = dispatch;
  subscribe(state, target) {
    this.state[state] = {
      _hook: target,
    };
    return () => Reflect.deleteProperty(this.state, state);
  }
}
let m = new monitor({
  start: (context) => {
    console.log("准备就绪");
    context.dispatch("running");
  },
  running: () => console.log("正在运行"),
  destory: () => console.log("销毁"),
});
let unsubscribe = m.subscribe("end", () => console.log("运行结束"));
m.dispatch("start");
