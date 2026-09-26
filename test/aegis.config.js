export const files = [
    "setup:test/setup.js",
    "test/stack.test.js",
    "test/empty.test.js",
    "test/**/*.test.js"
]

export const hooks = {
    "done": (results, base) => {
        base(results)
        console.log("This example shows how to use the default hooks + your code")
    }
}
