import * as nodeConsole from "node:console"
import * as path from "node:path"
import * as stream from "node:stream"
import * as threads from "node:worker_threads"
import * as url from "node:url"

import * as result from "@axel669/result"

import { aegis } from "./test-funcs.js"
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

aegis.state.send = send

const logstream = new stream.Writable({
    write(chunk, encoding, callback) {
        send`console.capture`({
            text: chunk.toString(),
        })
        callback()
    }
})
const oldConsole = console
const hookConsole = new nodeConsole.Console({
    stdout: logstream,
    stderr: logstream,
})
console = hookConsole
globalThis.console = hookConsole

const handlers = {
    "file.list": async (options) => {
        const { files } = options

        const time = timer.create()
        for (const file of files) {
            send`file.start`({
                file,
            })
            time.tick()
            const abspath = path.resolve(file)
            const testURL = url.pathToFileURL(abspath)

            aegis.state.tests = []
            const testFile = await import(testURL)
            const load = time.tick()

            send`file.load`({
                load,
                name: testFile.name ?? null,
            })
            for (const testConfig of aegis.state.tests) {
                send`test.start`({
                    name: testConfig.name,
                    timeout: testConfig.timeout ?? aegis.state.timeout
                })
                time.tick()
                aegis.state.results = []
                aegis.state.count = { pass: 0, fail: 0, total: 0 }
                await testConfig.func(aegis.state.userState)
                send`test.end`({
                    runtime: time.tick(),
                    results: aegis.state.results,
                })
            }
            send`file.end`()
        }

        send`done`()
    }
}
