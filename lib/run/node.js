/** @type {(runTests: SuiteRunner) => Promise<Runner>} */
export default async (runSuite) => {
    const path = await import("node:path")
    const url = await import("node:url")
    const { default: glob } = await import("fast-glob")
    return async (config) => {
        const { files } = config
        const fileList = await glob(files)
        const uniqFileList = [...new Set(fileList)]
        const globbedFiles = uniqFileList.map(
            file => [
                () => import(url.pathToFileURL(path.resolve(file))),
                file
            ]
        )
        return await runSuite({
            ...config,
            files: globbedFiles
        })
    }
}
