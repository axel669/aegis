const source = require("./source")

exports.test = function({Result, Section}, env) {
    const test = Math.random() * 2

    Section("smol rand")

    Result(test, {
        near: {
            target: 0.5,
            delta: 0.6,
        }
    })

    Section("source?")

    Result(source, {
        eq: 10
    })
}
