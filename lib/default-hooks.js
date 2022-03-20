exports.setup = (shared) => {
    console.log("Running tests")
    console.log("=".repeat(60))
}
exports.teardown = (shared) => {
    console.log("=".repeat(60))
}

exports.beforeFile = (filename) => {
    console.log("running", filename)
}
exports.afterFile = (filename) => {
}
