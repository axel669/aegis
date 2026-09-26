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

const runFile = async (testURL, time) => {
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
        await testConfig.func(fileState)
        send`test.end`({
            runtime: time.tick(),
            results: internal.state.results,
        })
    }
    send`file.end`()
}
const handlers = {
    "file.list": async (options) => {
        const { files } = options

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

            await runFile(testURL, time)
        }

        send`done`()
    }
}
