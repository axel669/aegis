import testRunner from "./test-runner.js"
export { $check } from "./check.js"
export { addCheck } from "./assertions.js"
export { $ } from "./access-proxy.js"
export { exitValue } from "./report.js"

import defaultHooks from "./default-hooks.js"
import defaultReport from "./report.js"

import initBrowser from "./run/browser.js"
import initNode from "./run/node.js"

/** @type {
    (parts: string[]) =>
        (tests: {
            [name: string]: AsyncTest | SyncTest
        })
        => CollectionConfig
} */
export const Collection = ([name]) =>
    (tests) => ({
        name,
        tests: Object.entries(tests).map(
            ([name, run]) => ({ name, run })
        )
    })

/** @type {SuiteRunner} */
const runSuite = async (userConfig) => {
    /** @type {Configuration} */
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
const init = (globalThis.global === undefined) ? initBrowser : initNode
const run = await init(runSuite)
export default run
