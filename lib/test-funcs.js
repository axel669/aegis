import * as result from "@axel669/result"

export const state = {
    userState: {},
    timeout: null,
}

const test = async (testConfig) => {
    state.tests.push(testConfig)
}
export const aegis = {
    test,
    state,
}

const assert = {
    eq: {
        type: "value",
        run: (value, target) => value === target,
        format: (value, target) => {
            const val = JSON.stringify(value)
            const tar = JSON.stringify(target)
            return `eq failed: Expected ${tar} got ${val}`
        }
    },
    throws: {
        type: "func",
        run: (res) => {
            return (res.ok === false)
        },
    },
    // throwsAsync: {
    //     type: "func",
    //     run: async (func) => {
    //         const wrapped = result.tryableAsync(func)
    //         const res = await wrapped()
    //         return (res.ok === false)
    //     },
    // },
}
const defMsg = (name) => () => `Check ${name} failed`
const checkAssertion = (assertion, command, state) => {
    state.count.total += 1
    if (assertion === undefined) {
        state.count.fail += 1
        state.results.push({
            name: command.name,
            pass: false,
            message: `@L${command.line} - No assertion func found for "${command.name}"`,
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

    const msgFunc = assertion?.format ?? defMsg(command.name)
    const message = msgFunc(command.value, ...command.args)
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
                assert[command.key],
                command,
                check
            )
        }
        state.results.push(check)
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
                const assertion = assert[key]
                const value = transformValue(source, assertion?.type, isAsync)
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
