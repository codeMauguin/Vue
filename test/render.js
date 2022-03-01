function maxArea(height) {
    var max = 0;
    var l = 0, r = height.length - 1;
    max = Math.max(max, (r - l) * Math.min(height[r], height[l]));
    while (l < r) {
        //移动判断两边是否比上次的小
        if (height[l] > height[r]) {
            r--;
            max = Math.max(max, (r - l) * Math.min(height[r], height[l]));
        }
        else {
            l++;
            max = Math.max(max, (r - l) * Math.min(height[r], height[l]));
        }
    }
    return max;
}
//从两端找 height*weight -1
console.log(maxArea([1, 2, 4, 3]));
function longestCommonPrefix(strs) {
    return strs.reduce(function (l, r) { return findPrefix(l, r); });
    function findPrefix(strl, strr) {
        var index = 0;
        while (index < strl.length && index < strr.length) {
            if (strr[index] === strl[index]) {
                index++;
            }
            else
                break;
        }
        return strr.slice(0, index);
    }
}
console.log(longestCommonPrefix(["flower", "flow", "flight"]));
function threeSum(nums) {
    var _a;
    // 1 2 3 4 5
    if (nums.length <= 2) {
        return [];
    }
    var startIndex = 0, endIndex = 1, result = [];
    while (endIndex < nums.length) {
        for (startIndex; startIndex < nums.length; startIndex++) {
            for (endIndex = startIndex + 1; endIndex < nums.length; endIndex++) {
                // @ts-ignore
                var index = nums.findIndex(function (r) { return r === 0 - nums[startIndex] - nums[endIndex]; });
                if (index > -1 && index !== startIndex && index !== endIndex) {
                    result.push([nums[startIndex], nums[endIndex], nums[index]].sort(function (a, b) { return a - b; }));
                }
            }
        }
    }
    return ((_a = result
        .map(function (value, index, array) {
        return array.lastIndexOf(value) === index ? value : undefined;
    })
        .filter(function (c) { return c !== undefined; })) !== null && _a !== void 0 ? _a : []);
}
console.log(threeSum([-1, 0, 1, 2, -1, -4]));
