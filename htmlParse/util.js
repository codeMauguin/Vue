/**
 * 使用二分插入,使数组保持有序的插入
 * @param {Array<any>} array
 * @param {any} element
 * @param {?Function} compare 默认{Number}类型，若其他类型情自定义compare
 * @returns {number|void|any[]}
 */
function branchInsert(
  array,
  element,
  compare = /**
   *@param {any} a
   *@param {any} b
   *@return {number}
   */ (a, b) => a - b,
) {
  if (array.length === 0) return array.push(element);
  if (array.length === 1) {
    if (compare(element, array[0]) > 0) array.push(element);
    else array.splice(0, 0, element);
    return;
  }
  var left = 0,
    right = array.length - 1,
    mid = Math.floor((right - left) / 2) + left;
  if (compare(element, array[left]) < 0) return array.unshift(element);
  if (compare(element, array[right]) > 0) return array.push(element);
  while (left < right) {
    if (
      compare(element, array[left]) > 0 &&
      compare(element, array[left + 1] < 0)
    ) {
      return array.splice(left + 1, 0, element);
    }
    if (compare(element, array[mid]) === 0) {
      return array.splice(mid + 1, 0, element);
    }
    if (
      compare(element, array[right - 1]) > 0 &&
      compare(element, array[right] < 0)
    ) {
      return array.splice(right, 0, element);
    }
    if (compare(element, array[mid]) > 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  throw new Error("Not available code");
}
var test = [];
branchInsert(test, 1);
branchInsert(test, 5);
branchInsert(test, 3);
branchInsert(test, 90);
branchInsert(test, 0);
console.log(test);
