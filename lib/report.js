const reset = "\x1b[0m"
const colors = {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
}

const log = Object.entries(colors).reduce(
    (funcs, [name, code]) => ({
        ...funcs,
        [name]: (msg) => console.log(`${code}${msg}${reset}`),
        [`${name}Group`]: (msg) => console.group(`${code}${msg}${reset}`),
    }),
    {}
)

function reportSection(section) {
    const failedAssertions = section.assertions.filter(
        ass => ass.failed.length > 0
    )
    if (failedAssertions.length === 0) {
        log.green(`✓ ${section.label}`)
        return
    }

    log.redGroup(`✘ ${section.label}`)
    for (const failedAss of failedAssertions) {
        const {location, failed} = failedAss
        console.group(`Line ${location.line}, Col ${location.col}`)
        for (const failure of failed) {
            console.log(failure.target, failure.name, failure.compare)
        }
        console.groupEnd()
    }
    console.groupEnd()
}

function reportResult(testResult) {
    const { sections } = testResult
    for (const section of sections) {
        // const failedSection = results
        //     .filter(res => res.failed.length > 0)
            // .flat()
        reportSection(section)
    }
}

function report(testResults, files) {
    // console.log(
    //     JSON.stringify(testResults, null, 2)
    // )
    // return
    let runtime = 0
    let loadtime = 0
    log.blue("-".repeat(50))
    log.blue("Test Results")
    log.blue("-".repeat(50))
    for (const file of files) {
        const testResult = testResults[file]
        const total = testResult.pass + testResult.fail
        const ratioPercent = ((testResult.pass * 100) / total).toFixed(2)
        const ratio = `${testResult.pass}/${total} (${ratioPercent}%)`

        runtime += testResult.time
        loadtime += testResult.loadTime
        log.magentaGroup(file)
        log.cyan(`Load time: ${colors.yellow}${testResult.loadTime}ms`)
        log.cyan(`Run time: ${colors.yellow}${testResult.time}ms`)
        log.cyan(`Assertions passed: ${ratio}`)
        // reportResult(testResult)
        const { sections } = testResult
        for (const section of sections) {
            reportSection(section)
        }
        console.groupEnd()
    }

    console.log("Total load time:", loadtime, "ms")
    console.log("Total run time:", runtime, "ms")
}

module.exports = report
