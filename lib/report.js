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
const logFail = (fail) => console.log(fail.message, ...fail.report)
const reportFile = (file) => {
    const { pass, total } = calcPass(file)
    const fileHead = `${file.file.name} (${file.file.path})`

    console.group(
        ...color.magenta(`${fileHead} - ${pass}/${total} passed`)
    )
    file.sections.forEach(
        (section) => {
            if (section.fail.length === 0) {
                console.log(
                    ...color.lightgreen(`✓ ${section.section.desc}`)
                )
                return
            }
            console.group(
                ...color.red(`✘ ${section.section.desc}`)
            )
            section.fail.forEach(logFail)
            console.groupEnd()
        }
    )
    console.groupEnd()
}

export default (results) => {
    if (results.type === "test-error") {
        console.log(...color.red(`Error while running test functions`))
        console.error(results.error)
        return 1
    }
    if (results.type === "check-error") {
        console.log(...color.red(`Error while running checks`))
        console.error(results.error)
        return 2
    }

    if (results.type === "check-fail") {
        console.log(...color.red("Check failed, stopping"))
        logFail(results.check)
        return 3
    }
    if (results.type === "section-fail") {
        console.log(...color.red("Section failed, stopping"))
        results.section.fail.forEach(logFail)
        return 3
    }
    if (results.type === "file-fail") {
        console.log(...color.red("File failed, stopping"))
        reportFile(results.file)
        return 4
    }

    const { pass, total, percentPass } = calcPass(results)
    const time = (results.executionTime + results.checkTime).toFixed(2)
    console.log(
        ...color.cyan(`Total Time: ${time}ms`)
    )
    console.group(...color.cyan(`Results: ${pass}/${total} (${percentPass}%) passed`))
    for (const file of results.files) {
        reportFile(file)
    }
    console.groupEnd()
    return 0
}
