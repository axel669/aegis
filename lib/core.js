import * as path from "node:path"
import * as url from "node:url"
import * as threads from "node:worker_threads"

import * as text from "./text.js"

export const run = (config) => new Promise(
    (resolve) => {
        const here = url.fileURLToPath(import.meta.url)
        const workerScript = path.resolve(
            path.dirname(here),
            "worker.js"
        )

        const worker = new threads.Worker(workerScript, { type: "module" })
        worker.on(
            "message",
            (msg) => {
                // console.log(`*msg: ${msg.code}`)
                handlers[msg.code]?.(msg.message)
            }
        )

        const files = []

        let timer = null
        let current = null
        let logs = []

        const handlers = {
            "done": () => {
                worker.terminate()
                const totalTime = performance.now()
                const results = {
                    files,
                    totalTime,
                    runtime: 0,
                    load: 0,
                    count: {
                        pass: 0,
                        fail: 0,
                        total: 0,
                    }
                }
                for (const file of files) {
                    results.count.pass += file.count.pass
                    results.count.fail += file.count.fail
                    results.count.total += file.count.total
                    results.runtime += file.runtime
                    results.load += file.load
                }
                config.hooks["done"](results)
                resolve(null)
            },
            "console.standard": (msg) => {
                // console.log(
                //     msg.text.slice(0, -1)
                // )
                process.stdout.write(msg.text)
                logs.push(msg.text)
            },
            "console.error": (msg) => {
                logs.push(msg.text)
            },
            "file.start": (msg) => {
                current = {
                    file: msg.file,
                    setup: msg.setup,
                    path: msg.path,
                    tests: [],
                    logs: [],
                    test: null,
                }
                logs = current.logs
                files.push(current)
                config.hooks["file.start"](current)
            },
            "file.load.fail": () => {
                console.log(
                    text.color.red(`Issye loading file: ${current.path}`)
                )
                process.stdout.write(logs[logs.length - 1])
                worker.terminate()
                resolve(null)
            },
            "file.load": (msg) => {
                current.load = msg.load
                current.name = msg.name
                config.hooks["file.load"](current)
            },
            "test.start": (msg) => {
                current.test = {
                    name: msg.name,
                    setup: msg.setup,
                    logs: [],
                }
                current.tests.push(current.test)
                logs = current.test.logs
                config.hooks["test.start"](msg)
                if (msg.timeout === null) {
                    return
                }
                timer = setTimeout(
                    () => {
                        console.log("timed out")
                        worker.terminate()
                        resolve(null)
                    },
                    msg.timeout
                )
            },
            "test.end": (msg) => {
                clearTimeout(timer)
                current.test.results = msg.results
                current.test.runtime = msg.runtime
                current.test.count = msg.results.reduce(
                    (count, check) => {
                        count.pass += check.count.pass
                        count.fail += check.count.fail
                        count.total += check.count.total
                        return count
                    },
                    { pass: 0, fail: 0, total: 0 }
                )
                config.hooks["test.end"](current.test)
            },
            "file.end": (msg) => {
                delete current.test
                current.count = { pass: 0, fail: 0, total: 0 }
                current.runtime = 0
                for (const test of current.tests) {
                    current.count.pass += test.count.pass
                    current.count.fail += test.count.fail
                    current.count.total += test.count.total
                    current.runtime += test.runtime
                }
                config.hooks["file.end"](msg)
            },
        }

        worker.postMessage({
            code: "file.list",
            files: config.files,
            setup: config.setup,
            timeout: config.timeout,
        })
    }
)
