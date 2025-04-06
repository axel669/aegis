import testRunner from "./test-runner.js"
export { $check } from "./check.js"
export { addCheck } from "./assertions.js"
export { $ } from "./access-proxy.js"

import defaultHooks from "./default-hooks.js"
import defaultReport from "./report.js"

export const Collection = ([name]) =>
    (tests) => ({
        name,
        tests: Object.entries(tests).map(
            ([name, run]) => ({ name, run })
        )
    })

const runTests = async (userConfig) => {
    const config = {
        files: userConfig.files,
        hooks: {
            ...defaultHooks,
            ...userConfig.hooks,
        },
        report: userConfig.report ?? defaultReport,
        failAction: userConfig.failAction ?? "ignore",
    }
    const result = await testRunner(config)
    return config.report(result)
}
const { default: run } = await import(
    (globalThis.global === undefined) ? "./run/browser.js" : "./run/node.js"
)
export default run(runTests)
