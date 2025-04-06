import { Collection, $check, $ } from "../lib/main.js"

import { stack } from "./source-code.mjs"

const items = stack()
export default Collection`Stack`({
    "Is Empty": () => {
        $check`is empty`
            .value(items)
            .eq($.size, 0)
    },
    "Empty Stack": () => {
        $check`throws when asked for top`
            .call(() => items.top)
            .throws()
        $check`throws when popped`
            .call(items.pop)
            .throws()

        items.push(1)
        $check`gains depth when pushed to`
            .value(items)
            .eq($.size, 1)
    },
    "Non Empty Stack": () => {
        items.push(2)
        $check`gains more depth when pushed`
            .value(items.size)
            .eq($, 2)
        const values = [items.pop(), items.pop()]
        $check`pops values in reverse order of push`
            .value(values)
            .eq($[0], 2)
            .eq($[1], 1)
    },
})
