# Vue

## 简介

- 实现 diff算法(bilibili中小鹿线)
- 没有采用VUE中正则解析模版，自己也有简单的模仿HTMLParser
- 实现API
    1. `@for`
    2. `:key`(除了for中key可以指定,其他根据属性和index确定key后期改为hashcode方法)
    3. `@click`
    4. `@if`
    5. `@else-if`(可以中间多个else-if)
    6. `@else`
    7. `@show`改为显示时优先使用原本的display而不是直接覆盖
    8. `mustache`模版解析-支持`{{}}`和`${}`语法插值

## 期望实现

- [ ] 组件式开发
- [ ] 路由导航
- [ ] 插槽

## 最近修复

1. `mustache`模版解析，多种情况的失败情况
2. `if、else-if、else`等标签在`dom`元素显示

# 算法学习

## 动态生成括号

```javascript
var generateParenthesis = function (n) {
    let result = [];
    dfs("", n, n, result);
    return result;

    function dfs(arg0, left, right, result) {
        if (left === 0 && right === 0) {
            result.push(arg0);
            return;
        }
        if (left > right) {
            return;
        }
        if (left > 0)
            dfs(`${arg0}(`, left - 1, right, result)
        if (right > 0)
            dfs(`${arg0})`, left, right - 1, result)
    }
}
```
