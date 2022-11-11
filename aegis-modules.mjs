#!/usr/bin/env node

import path from "path"
import url from "url"

import runTests from "./lib/test-runner.js"
import defaultHooks from "./lib/default-hooks.js"

const [, , filePattern, hooksFile = null] = process.argv

async function loadHooks(file) {
    if (file === null) {
        return defaultHooks
    }
    const userHooks = await import(
        url.pathToFileURL(
            path.resolve(hooksFile)
        )
    )
    return {
        ...defaultHooks,
        ...userHooks,
    }
}

const passed = await runTests(
    filePattern,
    await loadHooks(hooksFile),
    function (path) {
        return import(
            url.pathToFileURL(path)
        )
    }
)

if (passed === false) {
    process.exit(1)
}
