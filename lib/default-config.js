import * as text from "./text.js"

const totalPercent = (count) => {
    const p = count.pass / count.total
    return (p * 100).toFixed(2)
}
const statSummary = (source) => {
    const { pass, total } = source.count
    const percent = totalPercent(source.count)
    const runtime = `run: ${source.runtime.toFixed(4)}ms`
    const load = source.load
    if (load === undefined) {
        return `[${pass}/${total}, ${percent}%, ${runtime}]`
    }
    return `[${pass}/${total}, ${percent}%, ${runtime}, load: ${load.toFixed(4)}ms]`
}

const logTest = (test) => {
    if (test.count.fail === 0) {
        console.group(
            text.color.green(`${test.name} ${statSummary(test)}`)
        )
        test.results.forEach(logCheck)
        console.groupEnd()
        return
    }

    console.group(
        text.color.yellow(`${test.name} ${statSummary(test)}`)
    )
    test.results.forEach(logCheck)
    console.groupEnd()
}
const logCheck = (check) => {
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

export const files = []
export const hooks = {
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
        for (const result of results.files) {
            const name = result.name ?? result.file
            console.group(
                text.color.magenta(`${name} ${statSummary(result)}`)
            )
            for (const test of result.tests) {
                logTest(test)
            }
            console.groupEnd()
        }
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
