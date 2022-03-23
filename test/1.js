const data = [1,
              2,
              3,
              4];
const codebeast = {
    [Symbol.asyncIterator]: () => ({
        next() {
            if (data.length === 0) return Promise.resolve({done: true});
            return Promise.resolve({
                                       value: data.shift(),
                                       done : false
                                   })
        }
    })
}
console.log(codebeast)
for await (const da of codebeast) {
    console.log(da,
                data)
}
