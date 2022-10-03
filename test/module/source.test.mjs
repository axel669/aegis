import fetch from "node-fetch"

import source from "../source.js"

export async function test({Assert, Section}) {
    const test = Math.random()
    const obj = { test }
    const list = [1, 2, 3, 4]

    Section("modules pls work")

    Assert(obj)
        ("test").gt(0)
        ("test").lt(1)
    Assert(source)
        .neq(null)

    Section("cool stuff")

    Assert(list)
        .includes(3)
        .contains(3)
        ("length").eq(10)

    Section("postman echo")
    const res = await fetch("https://postman-echo.com/get")
    const result = await res.json()

    Assert(result)
        .has("args")
        ("args")(Object.keys)("length").eq(0)
}
