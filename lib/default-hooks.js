export default {
    setup(globalCtx) {
    },
    teardown(globalCtx) {
    },

    fileStart(file) {
        console.group(`Running tests: ${file.name} (${file.path})`)
    },
    sectionStart(section) {
        console.log(`Running case: ${section.desc}`)
    },
    sectionEnd(results) {
    },
    fileEnd(results) {
        console.groupEnd()
    },
}
