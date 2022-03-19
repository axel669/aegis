const path = require("path")
const { performance } = require("perf_hooks")

const glob = require("fast-glob")

const Query = require("./query")
const report = require("./report")

function last(array) {
    return array[array.length - 1]
}
const count = {
    pass: 0,
    fail: 0,
}
const time = {}
async function main() {
    const files = await glob("test/**/*.test.js")
    for (const file of files) {
        const fullPath = path.resolve(file)
        const env = {}

        const sections = []
        function Result(value, query) {
            const res = Query(value, query)
            last(sections)[1].push(res)

            const key = res === true ? "pass" : "fail"
            count[key] += 1
            return res === true
        }
        function Section(label) {
            sections.push([
                label,
                []
            ])
        }

        console.group(file)
        const start = performance.now()
        const {test, before, after} = require(fullPath)
        before?.(env)
        await test({Result, Section}, env)
        after?.(env)
        const end = performance.now()
        report(sections)
        time[file] = end - start
        console.groupEnd()
    }
    console.log(`${count.pass} Passed`)
    console.log(`${count.fail} Failed`)
    console.log(time)
}

main()
