const source = require("./source")

exports.test = function(Result, env) {
    const test = Math.random()

    console.log(source)
    console.log(Result(source))
    console.log(env)
}
