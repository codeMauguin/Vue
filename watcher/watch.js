export const watcher = (target, fn) => {
  target.__ob__ = fn;
  return () => Reflect.deleteProperty(target, "__ob__");
};
