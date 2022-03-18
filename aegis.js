function Result(value) {
    return {value}
}
async function main() {
    const env = {}
    const {test, before, after} = require("./test/source.test")
    before?.(env)
    await test(Result, env)
    after?.(env)
}

main()
