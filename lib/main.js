import testRunner from "./test-runner.js"
export { Check } from "./check.js"
export { addCheck } from "./assertions.js"
export { $ } from "./access-proxy.js"

import defaultHooks from "./default-hooks.js"
import defaultReport from "./report.js"

export const Test = ([name]) =>
    (...tests) => ({ name, tests })

export default async (userConfig) => {
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
    config.report(result)
}
