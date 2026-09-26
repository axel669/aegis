import * as text from "./text.js"

const totalPercent = (count) => {
    const p = count.pass / count.total
    return (p * 100).toFixed(2)
}
const statSummary = (source) => {
    const { pass, total } = source.count
    const percent = totalPercent(source.count)
    const runtime = `run: ${source.runtime.toFixed(4)}ms`
    if (source.load === undefined) {
        return `[${pass}/${total}, ${percent}%, ${runtime}]`
    }
    const load = `setup: ${source.load.toFixed(4)}ms`
    return `[${pass}/${total}, ${percent}%, ${runtime}, ${load}]`
}

const reportFile = (result) => {
    if (result.setup === true) {
        const name = result.name ?? `Setup: ${result.path}`
        const runtime = `run: ${result.load.toFixed(4)}ms`
        console.log(
            text.color.cyan(`${name} [${runtime}]`)
        )
        return
    }
    const name = result.name ?? result.file

    if (result.count.total === 0) {
        console.log(
            text.color.yellow(`? ${name} - No tests defined in file`)
        )
        return
    }

    console.group(
        text.color.magenta(`${name} ${statSummary(result)}`)
    )
    result.tests.forEach(reportTest)
    console.groupEnd()
}
const reportTest = (test) => {
    if (test.setup === true) {
        const runtime = `run: ${test.runtime.toFixed(4)}ms`
        console.log(
            text.color.cyan(`Setup [${runtime}]`)
        )
        return
    }
    if (test.count.total === 0) {
        console.log(
            text.color.yellow(`? ${test.name} - No checks done in test`)
        )
    }
    if (test.count.fail === 0) {
        console.group(
            text.color.green(`${test.name} ${statSummary(test)}`)
        )
        test.results.forEach(reportCheck)
        console.groupEnd()
        return
    }

    console.group(
        text.color.red(`${test.name} ${statSummary(test)}`)
    )
    test.results.forEach(reportCheck)
    console.groupEnd()
}
const reportCheck = (check) => {
    if (check.count.total === 0) {
        console.log(
            text.color.yellow(`? ${check.name} - no assertions`)
        )
        return
    }
    if (check.count.fail === 0) {
        console.log(
            text.color.lightgreen(`✓ ${check.name}`)
        )
        return
    }
    console.group(
        text.color.red(`✘ ${check.name}`)
    )
    const failed = check.results.filter(
        assertion => assertion.pass === false
    )
    for (const assertion of failed) {
        console.log(assertion.message)
    }
    console.groupEnd()
}

export const timeout = 30_000
export const files = []
export const hooks = {
    "init": () => {},
    "file.start": (info) => {
        console.group(`loading: ${info.file}`)
    },
    "file.load": (info) => {
        console.log("File loaded, running tests")
    },
    "test.start": (info) => {
        console.log(`-> ${info.name}`)
    },
    "test.end": () => {},
    "file.end": () => {
        console.groupEnd()
    },
    "done": (results) => {
        console.log(text.color.blue("------------------"))
        console.log(text.color.blue("|  Test Results  |"))
        console.log(text.color.blue("------------------"))
        results.files.forEach(reportFile)
        const libTime = (results.totalTime - results.runtime - results.load)
        const times = [
            `run: ${results.runtime.toFixed(4)}ms`,
            `load: ${results.load.toFixed(4)}ms`,
            `lib: ${libTime.toFixed(4)}ms`,
        ]
        const totalTime = results.totalTime.toFixed(4)
        const { pass, fail, total } = results.count
        const percent = ((pass / total) * 100).toFixed(2)

        console.log("")
        console.log(
            text.color.cyan(`Time: ${totalTime}ms (${times.join(", ")})`)
        )
        console.log(
            text.color.cyan(
                `Results: ${pass}/${total} (${fail} failed), ${percent}%`
            )
        )
        // console.dir(results, { depth: null })
    }
}
