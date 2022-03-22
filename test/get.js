const template = `<div :key="item.id" :ref="(ref)=>item.el=ref" :style="{background:item.block}"
         style="color:yellow"
         v-for="(item,index) in array" async>`;
const math = /(?<body>^<\w+(([^<>"'\/=]+)(?:\s*(=)\s*(?:"[^"]*"+|'[^']*'+|[^\s<>\/"']+))?)*>)/
//console.log(math.exec(template))
console.log(template.match(math));
