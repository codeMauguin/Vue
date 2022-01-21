# Vue

- 实现 diff算法(bilibili中小鹿线)
- 没有采用VUE中正则解析模版，自己也有简单的模仿HTMLParser
- 实现
  - `@for`
  - `:key`(除了for中key可以指定,其他根据属性和index确定key后期改为hashcode方法)
  - `@click`
  - `@if`
  - `@else-if`(可以中间多个else-if)
  - `@else`
  - `@show`改为显示时优先使用原本的display而不是直接覆盖

- [ ] 组件式开发
- [ ] 路由导航
