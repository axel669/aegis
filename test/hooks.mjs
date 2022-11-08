export const setup = (shared, assertions) => {
    assertions.sqof = (value, number) => value === (number ** 2)
}

// exports.setup = (shared) => {
//     console.log("setup2")
// }
// exports.teardown = (shared) => {
//     console.log("teardown2")
// }

// exports.beforeFile = (filename) => {
//     console.log("entering2", filename)
// }
// exports.afterFile = (filename) => {
//     console.log("leaving", filename)
// }
