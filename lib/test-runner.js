const path = require("path")

const glob = require("fast-glob")
const Query = require("./query")
const report = require("./report")
const Timer = require("./timer")

async function runTests(filePattern, hooks, load) {
    console.log(filePattern)
    const files = await glob(filePattern)

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
        function Assert(value, query) {
            const err = new Error()
            const callLocation = err.stack.split("\n")[2].slice(0, -1)
            const [line, col] = callLocation.split(":").slice(-2)
            const res = Query(value, query, { line, col })
            currentSection.assertions.push(res)

            const key = res.pass ? "pass" : "fail"
            count[key] += 1
            return res.pass
        }
        function Section(label) {
            currentSection = {
                label,
                assertions: [],
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
            ...count,
        }
    }
    hooks.teardown(shared)
    report(testResults, files)
}

module.exports = runTests
