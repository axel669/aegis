const path = require("path")

const glob = require("fast-glob")
const Query = require("./query")
const report = require("./report")
const Timer = require("./timer")

const mapsum = (source, map) => source.reduce(
    (total, item) => total + map(item),
    0
)
async function runTests(filePattern, hooks, load) {
    const files = await glob([filePattern, "!**/node_modules/**/*"])

    const shared = {}
    const testResults = {}
    const timer = Timer()

    hooks.setup(shared)
    for (const file of files) {
        const fullPath = path.resolve(file)

        const sections = []
        let currentSection = null
        const count = {
            pass: 0,
            fail: 0,
        }
        function Assert(value) {
            return Query(value, value, currentSection)
        }
        function Section(label) {
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
        hooks.beforeFile(file)
        timer.tick()
        await test({ Assert, Section }, shared)
        const time = timer.tick()
        hooks.afterFile(file)
        testResults[file] = {
            sections,
            time,
            loadTime,
            pass: mapsum(sections, s => s.pass),
            fail: mapsum(sections, s => s.fail.length),
        }
    }
    hooks.teardown(shared)
    report(testResults, files)
}

module.exports = runTests
