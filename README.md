# Vue

## 简介

- 实现 diff 算法(bilibili 中小鹿线)

- 没有采用 VUE 中正则解析模版，自己也有简单的模仿 HTMLParser

- 实现 API

  1. `@for`

  2. `:key`(除了 for 中 key 可以指定,其他根据属性和 index 确定 key 后期改为 hashcode 方法)

  3. `@click`

  4. `@if`

  5. `@else-if`(可以中间多个 else-if)

  6. `@else`

  7. `@show`改为显示时优先使用原本的 display 而不是直接覆盖

  8. `mustache`模版解析-支持`{{}}`和`${}`语法插值

  9. 在 `for` 循环中的 `@click` 方法全部使用 `global` 访问父节点

     - ```html
       <div @class="div" @for="(item,name,index) in hobby">
         <p>{{item}}-${name}-${index}</p>
         <button @click="adds(global.id)">测试</button>
       </div>
       ```

     - ```javascript
       this.global.state.value += 1;
       this.global.div = "ds sa";
       this.global.isShow = !this.global.isShow;
       this.global.id++;
       this.global.array[0].reverse();
       this.global.array[1].reverse();
       this.global.array.reverse();
       ```

  10. `watcher`

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
    if (left > 0) dfs(`${arg0}(`, left - 1, right, result);
    if (right > 0) dfs(`${arg0})`, left, right - 1, result);
  }
};
```
