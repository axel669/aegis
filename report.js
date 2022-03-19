const green = "\x1b[32m"
const red = "\x1b[31m"
const reset = "\x1b[0m"
"✓✘"

function printResult(label, failed) {
    if (failed.length === 0) {
        console.log(`${green}✓ ${label}${reset}`)
        return
    }

    console.group(`${red}✘ ${label}${reset}`)
    for (const fail of failed) {
        console.log(fail.value, fail.name, fail.compare)
    }
    console.groupEnd()
}

function report(sections) {
    for (const [label, results] of sections) {
        const failed = results.filter(res => res !== true)
        printResult(label, failed)
    }
}

module.exports = report
