exports.setup = (shared) => {
    console.log("Running tests")
    console.log("=".repeat(30))
}
exports.teardown = (shared) => {
    console.log("=".repeat(30))
}

exports.beforeFile = (filename) => {
    console.log("running", filename)
}
exports.afterFile = (filename) => {
}
