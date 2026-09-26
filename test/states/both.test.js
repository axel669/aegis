import { aegis, $ } from "@axel669/aegis"

export const name = "State Tests"
aegis.setup(
    (fileState) => {
        fileState.local = true
    }
)
aegis.test`Global State`({
    func: () => {
        $.check`can be accessed`(
            $.eq(aegis.globalState.testing, true)
        )
        aegis.globalState.testing = 69
    }
})
aegis.test`File State`({
    func: (fileState) => {
        $.check`file state carried`(
            $.eq(fileState.local, true)
        )
    }
})
aegis.test`Global State Part 2`({
    func: () => {
        $.check`can be modified in tests`(
            $.eq(aegis.globalState.testing, 69)
        )
    }
})
