#!/usr/bin/env node

import * as fs from "node:fs/promises"
import * as path from "node:path"
import * as url from "node:url"
import * as util from "node:util"

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

const configSource = await fs.readFile(
    path.resolve(args.values.config),
    "utf8"
)
const userConfig = await import(
    url.pathToFileURL(
        path.resolve(args.values.config)
    )
)
const config = {
    files: userConfig.files ?? defConfig.files,
    hooks: {
        ...defConfig.hooks,
        ...userConfig.hooks,
    }
}

await core.run(config)
