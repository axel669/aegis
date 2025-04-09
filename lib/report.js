const inBrowser = (typeof window === "object")
const reset = "\x1b[0m"
const colors = {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    lightgreen: "\x1b[92m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
}
const color = Object.fromEntries(
    Object.entries(colors).map(
        ([name, code]) => [
            name,
            (str) =>
                inBrowser
                    ? [`%c${str}`, `color: ${name};`]
                    : [`${code}${str}${reset}`]
        ]
    )
)

const calcPass = (result) => {
    const pass = result.pass.length
    const fail = result.fail.length
    const total = pass + fail
    const percentPass = ((pass * 100) / total).toFixed(2)

    return { pass, fail, total, percentPass }
}
const reportLabel = (label) => {
    if (label.fail.length === 0) {
        console.log(...color.lightgreen(`✓ ${label.label}`))
        return
    }
    console.group(...color.red(`✘ ${label.label}`))
    for (const check of label.fail) {
        console.log(...color.yellow(check.message), ...check.report)
    }
    console.groupEnd()
}
const reportSection = (section) => {
    console.group(section.info.name)
    section.labels.forEach(reportLabel)
    console.groupEnd()
}
const reportCollection = (collection) => {
    const { pass, total } = calcPass(collection)
    const fileHead = `${collection.info.name} (${collection.info.file})`

    console.group(
        ...color.magenta(`${fileHead} - ${pass}/${total} checks passed`)
    )
    collection.sections.forEach(reportSection)
    console.groupEnd()
}

export default (suiteResults) => {
    if (suiteResults.type === "test-error") {
        console.log(...color.red(`Error while running test functions`))
        console.error(suiteResults.error)
        return 2
    }
    if (suiteResults.type === "check-error") {
        console.log(...color.red(`Error while running checks`))
        for (const { error } of suiteResults.errors) {
            console.error(error)
        }
        return 3
    }

    // if (results.type === "check-fail") {
    //     console.log(...color.red("Check failed, stopping"))
    //     logCheck(results.check)
    //     return 4
    // }
    if (suiteResults.type === "section-fail") {
        console.log(...color.red("Section failed, stopping"))
        reportSection(suiteResults.section)
        return 5
    }
    if (suiteResults.type === "collection-fail") {
        console.log(...color.red("Collection failed, stopping"))
        reportCollection(suiteResults.file)
        return 6
    }

    const { pass, total, percentPass } = calcPass(suiteResults)
    const time = (suiteResults.loadTime + suiteResults.runTime).toFixed(2)
    const ltime = suiteResults.loadTime.toFixed(2)
    const rtime = suiteResults.runTime.toFixed(2)
    console.log(
        ...color.cyan(`Total Time: ${time}ms (load ${ltime}ms, run ${rtime}ms)`)
    )
    console.group(
        ...color.cyan(
            `Results: ${pass}/${total} (${percentPass}%) checks passed`
        )
    )
    for (const collection of suiteResults.results) {
        reportCollection(collection)
    }
    console.groupEnd()
    if (suiteResults.fail.length > 0) {
        return 1
    }
    return 0
}
