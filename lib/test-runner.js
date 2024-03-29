const path = require("path")

const glob = require("fast-glob")
const Query = require("./query")
const report = require("./report")
const Timer = require("./timer")
const assertions = require("./assertions.js")

const mapsum = (source, map) => source.reduce(
    (total, item) => total + map(item),
    0
)
async function runTests(filePattern, hooks, load) {
    const files = await glob([filePattern, "!**/node_modules/**/*"])

    const shared = {}
    const testResults = {}
    const timer = Timer()

    let passed = true
    await hooks.setup(shared, assertions)
    for (const file of files) {
        const fullPath = path.resolve(file)

        const sections = []
        let currentSection = null
        function Assert(value) {
            return Query(value, value, currentSection)
        }
        function Section(str, ...values) {
            const label =
                (typeof str === "string")
                ? str
                : String.raw(str, values)
            currentSection = {
                label,
                pass: 0,
                fail: []
            }
            sections.push(currentSection)
        }

        timer.tick()
        const { test } = await load(fullPath)
        const loadTime = timer.tick()
        await hooks.beforeFile(file)
        timer.tick()
        await test({ Assert, Section }, shared)
        const time = timer.tick()
        await hooks.afterFile(file)
        testResults[file] = {
            sections,
            time,
            loadTime,
            pass: mapsum(sections, s => s.pass),
            fail: mapsum(sections, s => s.fail.length),
        }
        passed = passed && testResults[file].fail === 0
    }
    await hooks.teardown(shared)
    report(testResults, files)
    return passed
}

module.exports = runTests
