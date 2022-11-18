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
    if (section.fail.length === 0) {
        log.green(`✓ ${section.label}`)
        return
    }

    log.redGroup(`✘ ${section.label}`)
    section.fail.forEach(
        msg => {
            if (Array.isArray(msg) === false) {
                console.log(msg)
                return
            }
            console.group(msg[0])
            msg.slice(1).forEach(args => console.log(...args))
            console.groupEnd()
        }
    )
    console.groupEnd()
}

function reportResult(testResult) {
    const { sections } = testResult
    for (const section of sections) {
        reportSection(section)
    }
}

function report(testResults, files) {
    let runtime = 0
    let loadtime = 0
    let totalAsserts = 0
    let passedAsserts = 0
    log.blue("-".repeat(35))
    log.blue("Test Results")
    log.blue("-".repeat(35))
    for (const file of files) {
        const testResult = testResults[file]
        const total = testResult.pass + testResult.fail
        const ratioPercent = ((testResult.pass * 100) / total).toFixed(2)
        const ratio = `${testResult.pass}/${total} (${ratioPercent}%)`

        runtime += testResult.time
        loadtime += testResult.loadTime
        totalAsserts += total
        passedAsserts += testResult.pass
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

    const assertRatio = ((passedAsserts * 100) / totalAsserts).toFixed(2)
    log.blue(`Assertions: ${passedAsserts}/${totalAsserts} (${assertRatio}%)`)
    console.log("Total load time:", loadtime, "ms")
    console.log("Total run time:", runtime, "ms")
}

module.exports = report
