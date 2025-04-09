export default async (runTests) => {
    const path = await import("node:path")
    const url = await import("node:url")
    const { default: glob } = await import("fast-glob")
    return async (config) => {
        const { files } = config
        const fileList = await glob(files)
        const globbedFiles = fileList.map(
            file => [
                () => import(url.pathToFileURL(path.resolve(file))),
                file
            ]
        )
        return await runTests({
            ...config,
            files: globbedFiles
        })
    }
}
