import path from "node:path"
import url from "node:url"

import glob from "fast-glob"

export default (runTests) =>
    async (config) => {
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
