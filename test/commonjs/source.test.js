const source = require("../source")

exports.test = function({Assert, Section}, env) {
    const test = Math.random() * 200

    Section("smol rand")

    Assert(test, {
        ":near": {
            target: 0.5,
            delta: 0.6,
        },
        ":lt": 2,
        ":gt": 0,
    })

    Section("source?")

    Assert(source, {
        ":eq": 10
    })
}
