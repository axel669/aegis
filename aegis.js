#!/usr/bin/env node

const path = require("path")

const runTests = require("./lib/test-runner")

const defaultHooks = require("./lib/default-hooks")

const [, , filePattern, hooksFile = null] = process.argv

function loadHooks(file) {
    if (file === null) {
        return defaultHooks
    }
    return {
        ...defaultHooks,
        ...require(
            path.resolve(hooksFile)
        )
    }
}

runTests(
    filePattern,
    loadHooks(hooksFile),
    function (path) {
        return require(path)
    }
)
