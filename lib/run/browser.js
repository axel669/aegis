export default (runTests) =>
    (config) => runTests({
        ...config,
        files: config.files.map(
            file => [
                () => import(
                    new URL(file, document.location)
                ),
                file
            ]
        ),
    })
