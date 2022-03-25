export default function (fn, text) {
  console.time(text);
  fn.apply(null,Array.prototype.slice.apply(arguments,[2]));
  console.timeEnd(text);
}
