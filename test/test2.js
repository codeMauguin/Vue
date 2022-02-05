/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
    if (s.length === 0 || s === (void 0) || s === null) {
        return 0;
    }
    let max = 1;
    let res = [s[0]];
    let index = 1;
    while (index < s.length) {
        let char = s[index++];
        if (Object.is(char, res[res.length - 1])) {
            //推送到记录数组中
            max = Math.max(max, res.length);
            res.length = 0;
            res.push(char);
        } else if (res.includes(char)) {
            //删除记录相同的前面元素，先推送本次子串
            max = Math.max(max, res.length);
            // [1,2,3]
            res.splice(0, res.indexOf(char) + 1);
            res.push(char);
        } else {
            res.push(char);
        }
    }
    return Math.max(max, res.length);
};
console.log(lengthOfLongestSubstring("dvdf"));
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
var findMedianSortedArrays = function (nums1, nums2) {
    //[1,2,3,4]
    if ((nums2.length + nums1.length) % 2 === 1) {
        console.log(concat(nums1, nums2));
        return concat(nums1, nums2)[(nums2.length + nums1.length + 1) / 2 - 1];
    } else {
        let p = (nums1.length + nums2.length) / 2;
        let sd = concat(nums1, nums2);
        return (sd[p] + sd[p - 1]) / 2
    }

    function concat(nums1, nums2) {
        // [] []
        let newArr = [];
        let nums1Index = 0;
        let nums2Index = 0;
        while (nums1Index < nums1.length && nums2Index < nums2.length) {
            if (nums1[nums1Index] > nums2[nums2Index]) {
                newArr.push(nums2[nums2Index++])
            } else {
                newArr.push(nums1[nums1Index++])
            }
        }
        if (nums1Index < nums1.length) {
            for (let index = nums1Index; index < nums1.length; index++) {
                newArr.push(nums1[index]);
            }
        } else if (nums2Index < nums2.length) {
            for (let index = nums2Index; index < nums2.length; index++) {
                newArr.push(nums2[index]);
            }
        }
        return newArr;
    }
};
console.log(findMedianSortedArrays([1, 3], [2]));
/**
 * 先找最大的回文串找到就返回
 * @param {string} s
 * @return {string}
 */
var longestPalindrome = function (s) {
    let max = "";
    let index = 0;
    while (index < s.length) {
        let next = findnext(s[index], s.length - 1);
        do {
            if (isPalindrome(s.slice(index, next + 1
            ))) {
                let ss = s.slice(index, next + 1);
                max = max.length > ss.length ? max : ss;
                break;
            }
            next = findnext(s[index], next - 1);
        } while (
            next > index && next >= 0
            );
        if (s.length - index < max
            .length)
            break
        index++;
    }

    /**
     *
     * @param {string} ss
     * @param {number} i
     * @returns i
     */
    function findnext(ss, i) {
        while (i >= 0) {
            if (ss === s[i]) {
                break;
            }
            i--;
        }
        return i;
    }

    /**
     * @param {string} str
     */
    function isPalindrome(str) {
        let l = 0, r = str.length - 1;
        let is = false;
        while (l <= r) {
            if (str[l] === str[r]) {
                l++;
                r--;
                is = true;
            } else {
                is = false;
                break;
            }
        }
        // 12 34
        return is;
    }

    return max;
};
console.log("ccc".slice(0, 1 + 2));
console.log(longestPalindrome("xaabacxcabaaxcabaax"));

/**
 *
 * @param {string} digits
 * @returns {string[]}
 */
function letterCombinations(digits) {
    const map = {
        "2": ["a", "b", "c"],
        "3": ["d", "e", "f"],
        "4": ["g", "h", "i"],
        "5": ["j", "k", "l"],
        "6": ["m", "n", "o"],
        "7": ["p", "q", "r", "s"],
        "8": ["t", "u", "v"],
        "9": ["w", "x", "y", "z"],
    };
    if (digits.length === 1) {
        return map[digits];
    }
    let res = [...map[digits[0]]];
    for (let i = 1; i < digits.length; i++) {
        res = merge(res, map[digits[i]]);
    }

    function merge(nums1, nums2) {
        let res = [];
        for (let i = 0; i < nums1.length; i++) {
            for (let j = 0; j < nums2.length; j++) {
                res.push(`${nums1[i]}${nums2[j]}`);
            }
        }
        return res;
    }

    return res;
}

console.log(letterCombinations("23"));
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var threeSumClosest = function (nums, target) {
    let r = nums.length - 1;
    let min = undefined;
    for (let i = 0; i < r; i++) {
        for (let j = i + 1; j < r; j++) {
            let sum = nums[i] + nums[j];
            let a = find(nums, j + 1, r, target - sum);
            if (min === undefined) {
                min = sum + a;
            } else {
                if ((Math.abs(min - target)) > (Math.abs(sum + a - target))) {
                    min = sum + a;
                }

            }
        }
    }
    return min;

    function find(nums, l, r, target) {
        // -1                      0,-2     tar-min

        // sort
        //事实证明排序可行，但消耗内存和时长性能太差
        //reduce 可行，时长相对较长比排序好--我觉得主要切割数组了
        // return nums.slice( l, r + 1 ).reduce( ( a, b ) =>
        // {
        //   return Math.abs( a - target ) > Math.abs( b - target ) ? b : a
        // } );


        let min = nums[l++];
        let disparity = Math.abs(target - min);
        while (l <= r) {
            if ((Math.abs(target - nums[l])) < disparity) {
                disparity = Math.abs(target - nums[l]);
                min = nums[l];
            }
            l++;
        }
        console.log("1", min);
        return min;
    }
};
/**
 * t:-1
 * -3 -2=> -5 ->差4
 */
console.log(threeSumClosest([1, 6, 9, 14, 16, 70], 81));
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[][]}
 */
var fourSum = function (nums, target) {
    if
    (nums.length < 4) {
        return []
    }
    let res = [];
    nums = nums.sort((a, b) => a - b);
    if (nums[0] === nums[nums.length - 1]) {
        if (nums[0] * 4 === target)
            return [[nums[0], nums[0], nums[0], nums[0]]]
        else
            return []
    }

    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            for (let k = j + 1; k < nums.length; k++) {
                for (let v = k + 1; v < nums.length; v++) {
                    if ((nums[i] + nums[j] + nums[k] + nums[v]) === target) {
                        let a = [nums[i], nums[j], nums[k], nums[v]].sort((a, b) => a - b);
                        if (!isRepeat(res, a))
                            res.push(a);
                    }
                }
            }
        }
    }
    return res;

    /**
     *
     * @param {number[][]} nums
     * @param {number[]} element
     */
    function isRepeat(nums, element) {
        return nums.some(r =>
            r.every((e, index) => Object.is(e, element[index]))
        )


    }
};
console.log(fourSum([2, 2, 2, 2, 2]
    , 8));


function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function (s) {
    if (s.length % 2 !== 0)
        return false;
    const exec = {
        pos: 0,
        reader() {
            return this.pos >= s.length ? -1 : s.charAt(this.pos++);
        },
    }
    let read = exec.reader();
    let stack = [];
    while (read !== -1) {
        switch (read) {
            case "{": {
                stack.push("}");
            }
                ;
                break;
            case "[": {
                stack.push("]");
            }
                ;
                break;
            case "(": {
                stack.push(")");
            }
                ;
                break;
            case ")": {
                let s = stack.pop();
                if (s !== ")")
                    return false;

            }
                break;
            case "}": {
                let s = stack.pop();
                if (s !== "}")
                    return false;

            }
                break;
            case "]": {
                let s = stack.pop();
                if (s !== "]")
                    return false;
            }
                break;
        }
        read = exec.reader();
    }
    return stack.length === 0;
};
console.log(isValid("{{()}}"));

function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
var mergeTwoLists = function (list1, list2) {

    let result;
    let l = list1
        , r = list2;
    if (l.val < r.val) {
        result = new ListNode(l.val, undefined);
        l = l.next;
    } else if (l.val === r.val) {
        result = new ListNode(l.val, undefined);
        l = l.next;
        r = r.next;
    } else {
        result = new ListNode(r.next, undefined);
        r = r.next;
    }
    let copy = result;
    while (l != null
    && r != null) {
        if (l.val < r.val) {
            copy = copy.next = new ListNode(l.val, undefined);
            l = l.next;
        } else if (l.val === r.val) {
            copy = copy.next = new ListNode(l.val, undefined);
            l = l.next;
            r = r.next;
        } else {
            copy = copy.next = new ListNode(r.val, undefined);
            r = r.next;
        }
    }
    if (l != null) {
        do {
            copy = copy.next = new ListNode(l.val, undefined);
            l = l.next;
        } while (l != null);
    } else {
        do {
            copy = copy.next = new ListNode(r.val, undefined);
            r = r.next;
        } while (r != null);
    }

    return result;

};

function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var swapPairs = function (head) {
    if (head === null || head.next === null) {
        return head;
    }
    let result = head.next
    head.next = head;
    head.next = result.next;
    let e = head;
    while (e.next != null && e.next.next != null) {
        e = swap(e, e.next, e.next.next);
    }

    function swap(parent, pre, suf) {
        parent.next = suf;
        suf.next = pre;
        pre.next = suf.next;
        return pre;
    }

    return result;
};
/**
 * @param {number} x
 * @param {number} n
 * @return {number}
 */
var myPow = function (x, n) {
    return calculation(x, x, 0)

    function calculation(x, ns, frequency) {
        if (frequency < n)
            return calculation(x * ns, ns, frequency++);
        else
            return x;
    }
};


function test(g = "default") {
    console.log(g);
}

test(undefined
)
