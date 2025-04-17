import { asyncCall } from "./evaluate.js"
import Timer from "./timer.js"
import { $$check } from "./check.js"

/** @import * from "./types.js" */

const mapsum = (source, map) => source.reduce(
    (t, n) => t + map(n),
    0
)

/** @type {(list: Value<CheckResult>[]) => LabelResult[]} */
const groupChecks = (list) => list.reduce(
    /** @type {(grouped: LabelResult[], result: Value<CheckResult>) => LabelResult[]} */
    (grouped, result) => {
        const check = result.value
        if (grouped[grouped.length - 1]?.label !== check.label) {
            grouped.push({
                label: check.label,
                checks: [],
                pass: [],
                fail: [],
            })
        }
        grouped[grouped.length - 1].checks.push(check)
        grouped[grouped.length - 1][check.status].push(check)
        return grouped
    },
    []
)
/** @type {(target: TimedResult, source: TimedResult[]) => void} */
const aggResults = (target, source) => {
    target.checks = source.map(check => check.checks).flat()
    target.pass = source.map(check => check.pass).flat()
    target.fail = source.map(check => check.fail).flat()
    target.runTime = mapsum(source, check => check.runTime)
}
/** @type {TestRunner} */
export default async (options) => {
    const timer = Timer()
    /** @type {CollectionResult[]} */
    const collectionResults = []
    const { files, hooks, failAction } = options
    const runScope = {}
    await hooks.setup(runScope)
    for (const [load, displayFile] of files) {
        timer.tick()
        const module = await load()
        const loadTime = timer.tick()
        const collectionConfig = module.default
        /** @type {CollectionResult} */
        const collection = {
            info: {
                name: collectionConfig.name,
                file: displayFile,
            },
            loadTime,
            sections: []
        }
        collectionResults.push(collection)
        hooks.collectionStart(collection.info)
        const fileScope = {}
        for (const test of collectionConfig.tests) {
            /** @type {SectionResult} */
            const section = {
                info: {
                    name: test.name,
                    collection,
                },
                runTime: 0,
                checks: [],
                pass: [],
                fail: [],
            }
            hooks.sectionStart(section.info)
            $$check.list = []
            timer.tick()
            const testResult = await asyncCall(test.run, { fileScope, runScope })
            const runTime = timer.tick()

            if (testResult.error !== undefined) {
                hooks.sectionEnd(null)
                hooks.collectionEnd(null)
                await hooks.teardown(runScope)
                return { type: "test-error", error: testResult.error }
            }

            const checkErrors = $$check.list.filter(
                res => res.error !== undefined
            )
            if (checkErrors.length > 0) {
                hooks.sectionEnd(null)
                hooks.collectionEnd(null)
                await hooks.teardown(runScope)
                return { type: "check-error", errors: checkErrors }
            }
            const labels = groupChecks($$check.list)

            aggResults(section, labels)
            section.labels = labels
            section.runTime = runTime

            if (section.fail.length > 0 && failAction === "afterSection") {
                hooks.collectionEnd(null)
                await hooks.teardown(runScope)
                return {
                    type: "section-fail",
                    section,
                }
            }

            collection.sections.push(section)
        }
        aggResults(collection, collection.sections)
        hooks.collectionEnd(collection)

        if (collection.fail.length > 0 && failAction === "afterCollection") {
            await hooks.teardown(runScope)
            return {
                type: "collection-fail",
                collection,
            }
        }
    }
    await hooks.teardown(runScope)
    /** @type {SuiteResult} */
    const suiteResults = {
        type: "complete",
        results: collectionResults,
    }
    aggResults(suiteResults, collectionResults)
    suiteResults.loadTime = mapsum(collectionResults, col => col.loadTime)
    return suiteResults
}
