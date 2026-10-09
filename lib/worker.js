import * as nodeConsole from "node:console"
import * as path from "node:path"
import * as stream from "node:stream"
import * as threads from "node:worker_threads"
import * as url from "node:url"

import * as result from "@axel669/result"

import * as internal from "./internals.js"
import * as timer from "./timer.js"

const core = threads.parentPort
core.on(
    "message",
    (msg) => handlers[msg.code]?.(msg)
)

const send = (parts, ...values) => {
    const code = String.raw(parts, ...values)
    return (message) => core.postMessage({
        code,
        message,
        time: Date.now(),
    })
}

internal.state.send = send

const stdstream = new stream.Writable({
    write(chunk, encoding, callback) {
        send`console.standard`({
            text: chunk.toString(),
        })
        callback()
    }
})
const errstream = new stream.Writable({
    write(chunk, encoding, callback) {
        send`console.error`({
            text: chunk.toString(),
        })
        callback()
    }
})
const oldConsole = console
const hookConsole = new nodeConsole.Console({
    stdout: stdstream,
    stderr: errstream,
})
console = hookConsole
globalThis.console = hookConsole

const absURL = (file, setup) => {
    const filepath = (setup === true) ? file.slice(6) : file
    const abspath = path.resolve(filepath)
    return url.pathToFileURL(abspath)
}
const safeImport = async (file) => {
    try {
        return {
            ok: true,
            value: await import(file)
        }
    }
    catch (error) {
        return { ok: false, error }
    }
}

const shouldRun = (config, targets) => {
    if (config.skip === true) {
        return false
    }
    if (targets.length === 0) {
        return true
    }
    if (config.setup === true) {
        return true
    }
    for (const tag of config.tags) {
        if (targets.includes(tag) === true) {
            return true
        }
    }
    return false
}
const skipped = Symbol("skipped")
const runTest = async (testConfig, fileState, tags) => {
    if (shouldRun(testConfig, tags) === false) {
        return result.Ok(skipped)
    }
    const wrapped = result.tryableAsync(testConfig.func)
    return await wrapped(fileState)
}
const runFile = async (info) => {
    const { testURL, time, setup, tags } = info

    internal.state.tests = []
    time.tick()
    const testFile = await safeImport(testURL)

    if (testFile.ok === false) {
        console.error(testFile.error)
        send`file.load.fail`()
        return
    }

    const load = time.tick()

    send`file.load`({
        load,
        name: testFile.value.name ?? null,
    })
    const fileState = {}
    for (const testConfig of internal.state.tests) {
        send`test.start`({
            name: testConfig.name,
            setup: testConfig.setup,
            timeout: testConfig.timeout ?? internal.state.timeout
        })
        time.tick()
        internal.state.results = []
        internal.state.count = { pass: 0, fail: 0, total: 0 }
        // const wrapped = result.tryableAsync(testConfig.func)
        // const testResult = await wrapped(fileState)
        const testResult = await runTest(testConfig, fileState, tags)
        if (testResult.ok === false) {
            return testResult
        }
        send`test.end`({
            runtime: time.tick(),
            results: internal.state.results,
            skipped: testResult.value === skipped,
        })
    }
    send`file.end`()
    return null
}
const handlers = {
    "file.list": async (options) => {
        const { files, tags } = options

        internal.state.timeout = options.timeout
        const time = timer.create()
        for (const file of files) {
            const setup = file.startsWith("setup:")
            send`file.start`({
                file,
                path: (setup === true) ? file.slice(6) : file,
                setup,
            })
            const testURL = absURL(file, setup)

            const failure = await runFile({
                testURL,
                time,
                setup,
                tags,
            })
            if (failure !== null) {
                send`error`({
                    error: failure.error.stack
                })
                process.exit(1)
            }
        }

        send`done`()
        process.exit(0)
    }
}
