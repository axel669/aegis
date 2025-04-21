#!/usr/bin/env node

import path from "node:path"
import url from "node:url"

import runTests from "./main.js"
import { asyncCall } from "./evaluate.js"

const [, , configFile = "aegis.config.mjs"] = process.argv

/** @type {Maybe<UserConfiguration>} */
const configLoad = await asyncCall(
    async () => {
        const configPath = path.resolve(configFile)

        /** @type {{config?: UserConfiguration}} */
        const module = await import(
            url.pathToFileURL(configPath)
        )
        if (module.config === undefined) {
            throw new Error(`Config file did not have "config" named export`)
        }
        const { config } = module
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
