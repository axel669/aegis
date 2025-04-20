import { Collection, $check, $ } from "../../../lib/main.js"

const rand = () => Math.random() * 10
export default Collection`Number Generator`({
    // runScope comes from the setup method, and can be modified by any test
    // during the runtime.
    "Creates correct range": ({ runScope, fileScope }) => {
        const n = rand()
        $check`is in range 0 <= n <= 10`
            .value(n)
            .in($, 0, 10)
        runScope.n = n
    },
    "Scope Value Example": ({ runScope }) => {
        $check`is a number`
            .value(runScope.n)
            .typeof($, "number")
            .instanceof($, Number)
    }
})
