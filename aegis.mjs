// const fs = require("fs").promises

// const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor

function Result(value) {
    return {value}
}
async function main() {
    // const {test} = require("./test/source.test")
    const {test} = await import("./test/module/source.test.mjs")
    await test(Result)
}

main()
