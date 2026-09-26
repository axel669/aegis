import { aegis, $ } from "@axel669/aegis"

const test = Math.random()
const list = [1, 2, 3, 4]
const obj = { test, list }
const map = new Map([
    ["a", "b"],
    [0, 1]
])
const asyncFunc = async () => {
    const res = await fetch("https://echo.axel669.net/some/path?param=thing")
    return await res.json()
}

aegis.createAssertion({
    name: "squared",
    type: "value",
    run: (target, sq) => (target ** 2) === sq
})
export const name = "Random Stuff"
aegis.test`Property Access`({
    func: () => {
        $.check`Numbers`(
            $.within(obj.test, 0, 1)
        )
        $.check`Arrays`(
            $.eq(obj.list.length, 4),
            $.eq(obj.list[3], 4)
        )
        $.check`Custom Check Function`(
            $.squared(obj.list[2], 9)
        )
    }
})
aegis.test`Async Stuff`({
    func: async () => {
        const data = await asyncFunc()
        $.check`fetched data`(
            $.eq(data.path, "/some/path"),
            $.eq(data.query.param, "thing")
        )
    }
})
aegis.test`Empty Test`(
    () => {}
)
aegis.test`Empty Checks`({
    func: () => {
        $.check`test isnt empty`(
            $.eq(1, 1)
        )
        $.check`empty prints different`()
    }
})
