function maxArea(height: number[]): number {
    let max = 0;
    let l = 0,
        r = height.length - 1;
    max = Math.max(max, (r - l) * Math.min(height[r], height[l]));
    while (l < r) {
        //移动判断两边是否比上次的小
        if (height[l] > height[r]) {
            r--;
            max = Math.max(max, (r - l) * Math.min(height[r], height[l]));
        } else {
            l++;
            max = Math.max(max, (r - l) * Math.min(height[r], height[l]));
        }
    }
    return max;
}

//从两端找 height*weight -1
console.log(maxArea([1, 2, 4, 3]));

function longestCommonPrefix(strs: string[]): string {
    return strs.reduce((l, r) => findPrefix(l, r));

    function findPrefix(strl: string, strr: string): string {
        let index = 0;
        while (index < strl.length && index < strr.length) {
            if (strr[index] === strl[index]) {
                index++;
            } else break;
        }
        return strr.slice(0, index);
    }
}

console.log(longestCommonPrefix(["flower", "flow", "flight"]));

function threeSum(nums: number[]): any {
    // 1 2 3 4 5
    if (nums.length <= 2) {
        return [];
    }
    let startIndex = 0,
        endIndex = nums.length - 1,
        result: number[][] = [];
    while (endIndex > nums.length) {
        for (startIndex; startIndex < endIndex; startIndex++) {
        }
    }
}

function letterCombinations(digits: string): string[] {
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
    let res: string[] = [];
    for (let i = 0; i < digits.length - 1; i++) {
        const tar: string[] = map[digits[i++]];
        for (let j = 0; j < tar.length; j++) {
            const de: string[] = map[digits[i]];
            for (let k: number = 0; k < de.length; k++) {
                res.push(`${tar[j]}${de[k]}`);
            }
        }
    }
    return res;
}

console.log(threeSum([-1, 0, 1, 2, -1, -4]));
