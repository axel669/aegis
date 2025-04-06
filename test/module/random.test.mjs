import { Collection, $check, $, addCheck } from "../../lib/main.js"

const test = Math.random()
const list = [1, 2, 3, 4]
const obj = { test, list }
const map = new Map([
    ["a", "b"],
    [0, 1]
])

addCheck.value.squared(
    (value, passedArg) => value ** 2 === passedArg
)
export default Collection`Random Stuff`({
    "Property Access": () => {
        $check`Numbers`
            .value(obj)
            .in($.test, 0, 1)
        $check`Arrays`
            .value(obj)
            .eq($.list.length, 4)
            .eq($.list[3], 4)
        $check`Custom Check Function`
            .value(obj)
            .squared($.list[2], 9)
    },
    "Function Access": () => {
        const key = 0
        $check`Call some functions (with variables)`
            .value(map)
            .eq($.get("a"), "b")
            .eq($.get(key), 1)
    },
    "Async Stuff": async () => {
        await $check`Fetching data`
            .call(
                async () => {
                    const res = await fetch("https://echo.axel669.net/some/path?param=thing")
                    return await res.json()
                }
            )
            .eq($.path, "/some/path")
            .eq($.query.param, "thing")
    },
    "Failed Check": () => {
        $check`Failure Example`
            .value(0)
            .eq($, 1)
    }
})
