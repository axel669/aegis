#!/usr/bin/env node

import * as path from "node:path"
import * as url from "node:url"
import * as util from "node:util"

import glob from "fast-glob"

import * as defConfig from "./default-config.js"
import * as core from "./core.js"

const args = util.parseArgs({
    allowPositionals: false,
    options: {
        config: {
            type: "string",
            short: "c",
        }
    }
})

const userConfig = await import(
    url.pathToFileURL(
        path.resolve(args.values.config)
    )
)

const sources = userConfig.files ?? defConfig.files
const files = []
const filelist = async (entry) => {
    if (entry.startsWith("setup:") === true) {
        return [ entry ]
    }
    const list = await glob(entry)
    return list.filter(
        file => files.includes(file) === false
    )
}
for (const entry of sources) {
    const list = await filelist(entry)
    files.push(...list)
}

await core.run({
    files,
    timeout: userConfig.timeout ?? defConfig.timeout,
    hooks: {
        ...defConfig.hooks,
        ...userConfig.hooks,
    }
})
