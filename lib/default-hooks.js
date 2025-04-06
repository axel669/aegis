export default {
    setup(globalCtx) {
    },
    teardown(globalCtx) {
    },

    collectionStart(collection) {
        console.group(`Running collection: ${collection.name} (${collection.file})`)
    },
    sectionStart(section) {
        console.log(`Running Section: ${section.name}`)
    },
    sectionEnd(results) {
    },
    collectionEnd(results) {
        console.groupEnd()
    },
}
