export default function (fn, text) {
  console.time(text);
  fn();
  console.timeEnd(text);
}
