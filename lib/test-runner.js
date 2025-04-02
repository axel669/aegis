import { checkFunction } from "./assertions.js"
import { getPropValue, generateValue, runCheck } from "./evaluate.js"
import Timer from "./timer.js"
import { check } from "./check.js"

const mapsum = (source, map) => source.reduce(
    (t, n) => t + map(n),
    0
)

const call = async (f, ...args) => {
    try {
        return [await f(...args)]
    }
    catch (err) {
        return err
    }
}
export default async (options) => {
    const timer = Timer()
    const results = []
    const { files, hooks, failAction } = options
    const runScope = {}
    await hooks.setup(runScope)
    for (const [load, displayFile] of files) {
        timer.tick()
        const module = await load()
        const loadTime = timer.tick()
        const testGroup = module.default
        const file = {
            name: testGroup.name,
            path: displayFile,
        }
        const fileResults = {
            file,
            loadTime,
            sections: []
        }
        results.push(fileResults)
        hooks.fileStart(file)
        const fileScope = {}
        for (const test of testGroup.tests) {
            const section = {
                desc: test.name.replaceAll("_", " "),
                name: test.name,
                file,
            }
            const sectionResults = {
                section,
                pass: [],
                fail: [],
            }
            hooks.sectionStart(section)
            check.list = []
            timer.tick()
            const testResult = await call(test, { fileScope, runScope })

            if (testResult instanceof Error) {
                hooks.sectionEnd(null)
                hooks.fileEnd(null)
                await hooks.teardown(runScope)
                return { type: "test-error", error: testResult }
            }

            const runtime = timer.tick()
            for (const checkInfo of check.list) {
                const { name, args, path, gen, line } = checkInfo
                const baseValue = await generateValue(gen)
                const checkedValue = path.reduce(
                    (current, step) => getPropValue(current, step),
                    baseValue
                )
                const { type, check } = checkFunction[name]
                const callResult = await call(
                    runCheck,
                    { value: checkedValue, type, check, args, name, line }
                )
                if (callResult instanceof Error) {
                    hooks.sectionEnd(null)
                    hooks.fileEnd(null)
                    await hooks.teardown(runScope)
                    return { type: "check-error", error: callResult }
                }
                const result = callResult[0]
                if (result.status === "fail" && failAction === "afterCheck") {
                    hooks.sectionEnd(null)
                    hooks.fileEnd(null)
                    await hooks.teardown(runScope)
                    return {
                        type: "check-fail",
                        check: result,
                        file,
                    }
                }
                sectionResults[result.status].push(result)
            }
            const checktime = timer.tick()
            sectionResults.executionTime = runtime
            sectionResults.checkTime = checktime
            hooks.sectionEnd(sectionResults)

            if (failAction === "afterSection") {
                hooks.fileEnd(null)
                await hooks.teardown(runScope)
                return {
                    type: "section-fail",
                    section: sectionResults,
                }
            }

            fileResults.sections.push(sectionResults)
        }
        fileResults.pass = fileResults.sections.map(sec => sec.pass).flat()
        fileResults.fail = fileResults.sections.map(sec => sec.fail).flat()
        fileResults.executionTime = mapsum(fileResults.sections, s => s.executionTime)
        fileResults.checkTime = mapsum(fileResults.sections, s => s.checkTime)
        hooks.fileEnd(fileResults)

        if (failAction === "afterFile") {
            await hooks.teardown(runScope)
            return {
                type: "file-fail",
                file: fileResults
            }
        }
    }
    const testResults = {
        type: "complete",
        files: results,
        pass: results.map(file => file.pass).flat(),
        fail: results.map(file => file.fail).flat(),
        executionTime: mapsum(results, s => s.executionTime),
        checkTime: mapsum(results, s => s.checkTime),
    }
    await hooks.teardown(runScope)
    return testResults
}
