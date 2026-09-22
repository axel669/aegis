import { aegis, $ } from "@axel669/aegis"

import { stack } from "./source-code.mjs"

const items = stack()
const wait = (time) => new Promise(
    resolve => setTimeout(resolve, time)
)

console.time("testing")
console.table([
    { a: 1, b: 2 },
    { a: 1, b: 2 },
    { a: 1, b: 2 },
    { a: 1, b: 2 },
    { a: 1, b: 2 },
])
console.timeEnd("testing")

export const name = "Stack"
aegis.test({
    name: "New Stack",
    func: async () => {
        $.check`is empty`(
            $.eq(items.size, 0)
        )
    },
    timeout: 3_000
})
aegis.test({
    name: "Empty Stack",
    func: async () => {
        $.check`throws when asked for top`(
            $.throws(() => items.top)
        )
        $.check`throws when popped`(
            await $.throwsAsync(items.pop)
        )

        items.push(1)
        console.log("items", items.size)
        $.check`gains depth when pushed to`(
            $.eq(items.size, 1)
        )
    },
})
aegis.test({
    name: "Non Empty Stack",
    func: () => {
        items.push(2)
        $.check`gains more depth when pushed`(
            $.eq(items.size, 2)
        )
        const values = [items.pop(), items.pop()]
        $.check`pops values in reverse order of push and shrinks`(
            $.eq(values[0], 2),
            $.eq(values[1], 1),
            $.eq(items.size, 0),
        )
    },
})
aegis.test({
    name: "Errors Print Properly",
    func: () => {
        $.check`check failed`(
            $.eq(1, 2)
        )
        $.check`doesn't exist`(
            $.nice("wat")
        )
    }
})
