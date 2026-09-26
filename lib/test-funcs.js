import * as result from "@axel669/result"

import * as internal from "./internals.js"
import * as assertion from "./assertion.js"

const setup = async (setupFunc) => {
    internal.state.tests.push({
        name: null,
        setup: true,
        func: setupFunc,
    })
}
const test = (parts, ...values) =>
    (testConfig) => {
        const config =
            (typeof testConfig === "function")
            ? { func: testConfig }
            : testConfig
        internal.state.tests.push({
            ...config,
            name: String.raw(parts, ...values),
            setup: false,
        })
    }
export const aegis = {
    test,
    setup,
    globalState: internal.state.globalState,
    createAssertion: assertion.createAssertion,
}

const defMsg = (name) => () => `${name} assertion failed`
const checkAssertion = (assertion, command, state) => {
    state.count.total += 1
    if (assertion === undefined) {
        state.count.fail += 1
        const { name, line } = command
        state.results.push({
            name: command.name,
            pass: false,
            message: `@L${line} - No assertion handler found for "${name}"`,
            line: command.line,
        })
        return
    }
    const pass = assertion.run(command.value, ...command.args)

    if (pass === true) {
        state.count.pass += 1
        state.results.push({
            name: command.name,
            line: command.line,
            pass: true,
            message: null,
        })
        return true
    }

    const msgFunc = assertion?.error ?? defMsg(command.name)
    const handlerMessage = msgFunc(command.value, ...command.args)
    const message = `${command.name} failed: ${handlerMessage}`
    state.count.fail += 1
    state.results.push({
        name: command.name,
        line: command.line,
        pass: false,
        message: `@L${command.line} - ${message}`,
    })
    return pass
}

const check = (parts, ...values) => {
    const name = String.raw(parts, ...values)
    return (...commands) => {
        const check = {
            name,
            results: [],
            count: {
                pass: 0,
                fail: 0,
                total: 0,
            }
        }
        for (const command of commands) {
            const pass = checkAssertion(
                assertion.handlers[command.key],
                command,
                check
            )
        }
        internal.state.results.push(check)
    }
}
const parseLine = (err) => {
    const stack = err.stack
    const lines = [...stack.matchAll(/(@|at).*:(\d+):(\d+)/g)]
    return parseInt(lines[1][2])
}
const transformValue = (source, type, isAsync) => {
    if (type === "func") {
        if (isAsync === true) {
            return result.tryableAsync(source)()
        }
        return result.tryable(source)()
    }
    return source
}
export const $ = new Proxy(
    {},
    {
        get(_, name) {
            if (name === "check") {
                return check
            }
            const key = name.replace(/Async$/, "")
            const isAsync = name.endsWith("Async")
            return (source, ...args) => {
                const line = parseLine(new Error(""))
                const assertionHandler = assertion.handlers[key]
                const value = transformValue(
                    source,
                    assertionHandler?.type,
                    isAsync
                )
                if (isAsync === true) {
                    return value.then(
                        value => ({ key, name, value, args, line })
                    )
                }
                return { key, name, value, args, line }
            }
        }
    }
)
