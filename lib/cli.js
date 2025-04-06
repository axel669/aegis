#!/usr/bin/env node

import path from "node:path"
import url from "node:url"

import runTests from "./main.js"
import { asyncCall } from "./evaluate.js"

const [, , configFile = "aegis.config.mjs"] = process.argv

const configLoad = await asyncCall(
    async () => {
        const configPath = path.resolve(configFile)

        const { config } = await import(
            url.pathToFileURL(configPath)
        )
        return config
    }
)
if (configLoad.error !== undefined) {
    console.log("Error loading config")
    console.error(configLoad.error)
    process.exit(100)
}

const returnCode = await runTests(configLoad.value)
process.exit(returnCode)
