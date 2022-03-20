import source from "../source.js"

export function test({Assert, Section}) {
    const test = Math.random()
    const obj = { test }

    Section("modules pls work")

    Assert(obj, {
        "test:gt": 0,
        "test:lt": 1
    })
    Assert(source, {
        ":ne": null
    })
}
