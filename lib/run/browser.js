/** @type {(runTests: SuiteRunner) => Runner} */
export default (runSuite) =>
    (config) => runSuite({
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
